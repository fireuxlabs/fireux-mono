#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash, createSign } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTIONS = ['apps/misebox-app/kitchens', 'kitchens']
const DEFAULT_BACKUP_ROOT = 'temp/sproochli-menu-refresh'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:refresh-kitchen-menu-sproochli-translations'
const CACHE_COLLECTION = 'translation_cache'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/cloud-translation'
const TRANSLATE_CHUNK_SIZE = 40

let cachedToken = null

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) =>
  normalizeString(value).replace(/_/g, '-').toLowerCase()
const unique = (values) => [...new Set(values.map(normalizeLanguageCode).filter(Boolean))]
const timestampId = () => new Date().toISOString().replace(/[:.]/g, '-')
const slugifyPath = (value) =>
  normalizeString(value).replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readServiceAccount(pathValue) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`Service account file not found: ${pathValue}`)
  }

  const account = JSON.parse(await readFile(resolvedPath, 'utf8'))
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return account
}

function getServiceAccountField(account, snake, camel) {
  return normalizeString(account[snake] || account[camel])
}

function printHelp() {
  console.log(`
Refresh Kitchen Menu Sproochli translations.

Dry-run by default. It writes backup/review files to temp, but does not change Firestore
unless --commit is passed.

Usage:
  node scripts/migrations/refresh-kitchen-menu-sproochli-translations.mjs [options]

Options:
  --commit                         Replace Firestore translations after backup.
  --commit-missing-cache           Write only missing translation_cache docs.
  --commit-source-repairs          Repair empty source fields from source-language maps only.
  --no-ai                          Inventory/export only; do not call Google Translate.
  --repair-empty-source            Use source-language map text when canonical source text is empty.
  --allow-source-loss              Allow commit even when old translations would be removed because source text is empty.
  --include-drafts                 Include draft/archived menus. Default: published only.
  --kitchen-collections <csv>      Collection paths. Default: apps/misebox-app/kitchens,kitchens
  --kitchen-id <id>                Limit to one kitchen id.
  --menu-id <id>                   Limit to one menu id.
  --limit <n>                      Limit processed menus.
  --backup-root <path>             Backup/report root. Default: temp/sproochli-menu-refresh
  --database <id>                  Firestore database id. Default: misebox.
  --service-account <path>         Service account JSON path.
`)
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function cacheDocId(fieldId, targetLanguage) {
  const field = normalizeString(fieldId)
  const language = normalizeLanguageCode(targetLanguage)
  if (!field || !language) return ''

  const hash = createHash('sha256')
    .update([field, language].join('\n'), 'utf8')
    .digest('hex')
  return `${language}__${hash.slice(0, 40)}`
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
  }
}

function createdStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function cacheDocPayload({
  id,
  fieldId,
  sourceLanguage,
  targetLanguage,
  sourceText,
  translatedText,
  provider,
}) {
  return {
    id,
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: normalizeLanguageCode(sourceLanguage),
    target_language: normalizeLanguageCode(targetLanguage),
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: normalizeString(provider) || 'unknown',
    source_hash: sourceHash(sourceText),
    usage_count: 1,
    reviewed: false,
    created: createdStamp(),
    updated: updatedStamp(),
  }
}

function normalizeMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const map = {}
  for (const [language, text] of Object.entries(value)) {
    const code = normalizeLanguageCode(language)
    const valueText = normalizeString(text)
    if (code && valueText) map[code] = valueText
  }
  return map
}

function plainDoc(snap) {
  return {
    id: snap.id,
    path: snap.ref.path,
    data: snap.data() || {},
  }
}

function jsonStringify(value) {
  return JSON.stringify(
    value,
    (_key, entry) => {
      if (entry && typeof entry.toDate === 'function') {
        return entry.toDate().toISOString()
      }
      return entry
    },
    2
  )
}

async function getGoogleAccessToken(account) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const clientEmail = getServiceAccountField(account, 'client_email', 'clientEmail')
  const privateKey = getServiceAccountField(account, 'private_key', 'privateKey')
  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service-account client email or private key')
  }

  const encodeBase64Url = (value) =>
    Buffer.from(value)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  const now = Math.floor(Date.now() / 1000)
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: TOKEN_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )
  const unsignedToken = `${header}.${claim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()
  const assertion = `${unsignedToken}.${encodeBase64Url(
    signer.sign(privateKey.replace(/\\n/g, '\n'))
  )}`

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const tokenData = await tokenResponse.json().catch(() => ({}))

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google auth failed')
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt:
      Date.now() + Math.max(Number(tokenData.expires_in || 3600) - 60, 60) * 1000,
  }

  return cachedToken.token
}

async function translateBatch(account, { sourceLanguage, targetLanguage, texts }) {
  const source = normalizeLanguageCode(sourceLanguage)
  const target = normalizeLanguageCode(targetLanguage)
  if (source === target) return texts.map(normalizeString)

  const projectId = getServiceAccountField(account, 'project_id', 'projectId')
  const token = await getGoogleAccessToken(account)
  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${encodeURIComponent(
      projectId
    )}:translateText`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: texts,
        mimeType: 'text/plain',
        sourceLanguageCode: source,
        targetLanguageCode: target,
      }),
    }
  )
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error?.message || data.error?.status || 'Google Translate failed')
  }

  return (data.translations || []).map((entry) =>
    normalizeString(entry?.translatedText)
  )
}

async function discoverMenus(db, options) {
  const discovered = []

  for (const kitchenCollectionPath of options.kitchenCollections) {
    const kitchensSnap = await db.collection(kitchenCollectionPath).get()

    for (const kitchenSnap of kitchensSnap.docs) {
      if (options.kitchenId && kitchenSnap.id !== options.kitchenId) continue

      const menusSnap = await kitchenSnap.ref.collection('menus').get()
      if (menusSnap.empty) continue

      for (const menuSnap of menusSnap.docs) {
        const menu = menuSnap.data() || {}
        if (options.menuId && menuSnap.id !== options.menuId) continue
        if (!options.includeDrafts && normalizeString(menu.status) !== 'published') {
          continue
        }

        discovered.push({
          kitchenCollectionPath,
          kitchenSnap,
          menuSnap,
        })

        if (options.limit && discovered.length >= options.limit) return discovered
      }
    }
  }

  return discovered
}

function collectLanguages({ kitchen, menu, cacheDocs, inlineMaps }) {
  const settings =
    kitchen.language_settings &&
    typeof kitchen.language_settings === 'object' &&
    !Array.isArray(kitchen.language_settings)
      ? kitchen.language_settings
      : {}
  const fromSettings = [
    ...(Array.isArray(settings.attached_languages) ? settings.attached_languages : []),
    ...(Array.isArray(settings.cache_languages) ? settings.cache_languages : []),
    ...(Array.isArray(settings.public_languages) ? settings.public_languages : []),
  ]
  const fromInline = inlineMaps.flatMap((map) => Object.keys(map || {}))
  const fromCache = cacheDocs.map((doc) => doc.data.target_language)
  const sourceLanguage =
    normalizeLanguageCode(menu.source_language) ||
    normalizeLanguageCode(settings.default_language) ||
    'en'

  return unique([...fromSettings, ...fromInline, ...fromCache, sourceLanguage])
}

function makeTask({
  kind,
  docSnap,
  sourceLanguage,
  sourceText,
  sourceField,
  mapField,
  fieldId,
  oldMap,
}) {
  return {
    kind,
    docPath: docSnap.ref.path,
    docRef: docSnap.ref,
    sourceLanguage,
    sourceText: normalizeString(sourceText),
    sourceField,
    mapField,
    fieldId,
    oldMap: normalizeMap(oldMap),
    newMap: {},
    failures: [],
    sourceRepairedFromMap: false,
  }
}

async function readMenuBundle(entry) {
  const { kitchenSnap, menuSnap } = entry
  const kitchen = kitchenSnap.data() || {}
  const menu = menuSnap.data() || {}
  const sectionsSnap = await menuSnap.ref.collection('sections').get()
  const cacheSnap = await menuSnap.ref.collection(CACHE_COLLECTION).get()
  const itemSnaps = await Promise.all(
    sectionsSnap.docs.map((sectionSnap) => sectionSnap.ref.collection('items').get())
  )
  const dishIds = unique(
    itemSnaps.flatMap((snap) =>
      snap.docs
        .map((itemSnap) => itemSnap.data() || {})
        .filter((item) => normalizeString(item.status) !== 'archived')
        .map((item) => item.dish_id)
    )
  )
  const dishSnaps = []
  for (const dishId of dishIds) {
    const dishSnap = await kitchenSnap.ref.collection('dishes').doc(dishId).get()
    if (dishSnap.exists) dishSnaps.push(dishSnap)
  }

  return {
    kitchen,
    menu,
    sections: sectionsSnap.docs,
    itemSnaps,
    dishes: dishSnaps,
    cacheDocs: cacheSnap.docs.map(plainDoc),
    cacheRefs: cacheSnap.docs.map((snap) => snap.ref),
  }
}

function buildTasks(bundle, options = {}) {
  const sourceLanguage =
    normalizeLanguageCode(bundle.menu.source_language) ||
    normalizeLanguageCode(bundle.kitchen.language_settings?.default_language) ||
    'en'
  const tasks = [
    makeTask({
      kind: 'menu.name',
      docSnap: bundle.menuSnap,
      sourceLanguage,
      sourceText: bundle.menu.name,
      sourceField: 'name',
      mapField: 'names',
      fieldId: `menu:${bundle.menuSnap.id}:name`,
      oldMap: bundle.menu.names || bundle.menu.translations,
    }),
    makeTask({
      kind: 'menu.description',
      docSnap: bundle.menuSnap,
      sourceLanguage,
      sourceText: bundle.menu.description,
      sourceField: 'description',
      mapField: 'descriptions',
      fieldId: `menu:${bundle.menuSnap.id}:description`,
      oldMap: bundle.menu.descriptions,
    }),
  ]

  for (const sectionSnap of bundle.sections) {
    const section = sectionSnap.data() || {}
    if (normalizeString(section.status) === 'archived') continue
    tasks.push(
      makeTask({
        kind: 'section.label',
        docSnap: sectionSnap,
        sourceLanguage,
        sourceText: section.label,
        sourceField: 'label',
        mapField: 'labels',
        fieldId: `section:${sectionSnap.id}:label`,
        oldMap: section.labels || section.translations,
      }),
      makeTask({
        kind: 'section.description',
        docSnap: sectionSnap,
        sourceLanguage,
        sourceText: section.description,
        sourceField: 'description',
        mapField: 'descriptions',
        fieldId: `section:${sectionSnap.id}:description`,
        oldMap: section.descriptions,
      })
    )
  }

  for (const dishSnap of bundle.dishes) {
    const dish = dishSnap.data() || {}
    const dishSourceLanguage = normalizeLanguageCode(dish.source_language) || sourceLanguage
    tasks.push(
      makeTask({
        kind: 'dish.name',
        docSnap: dishSnap,
        sourceLanguage: dishSourceLanguage,
        sourceText: dish.name,
        sourceField: 'name',
        mapField: 'names',
        fieldId: `dish:${dishSnap.id}:name`,
        oldMap: dish.names,
      }),
      makeTask({
        kind: 'dish.description',
        docSnap: dishSnap,
        sourceLanguage: dishSourceLanguage,
        sourceText: dish.description,
        sourceField: 'description',
        mapField: 'descriptions',
        fieldId: `dish:${dishSnap.id}:description`,
        oldMap: dish.descriptions,
      })
    )
  }

  if (options.repairEmptySource) {
    for (const task of tasks) {
      if (task.sourceText) continue

      const sourceMapText = normalizeString(task.oldMap[task.sourceLanguage])
      if (!sourceMapText) continue

      task.sourceText = sourceMapText
      task.sourceRepairedFromMap = true
    }
  }

  return tasks.filter((task) => task.sourceText || Object.keys(task.oldMap).length)
}

async function translateTasks(account, tasks, targetLanguages, noAi) {
  for (const task of tasks) {
    for (const language of targetLanguages) {
      task.newMap[language] =
        normalizeLanguageCode(language) === normalizeLanguageCode(task.sourceLanguage)
          ? task.sourceText
          : ''
    }
  }

  if (noAi) return

  const groups = new Map()
  for (const task of tasks) {
    if (!task.sourceText) continue
    for (const language of targetLanguages) {
      if (normalizeLanguageCode(language) === normalizeLanguageCode(task.sourceLanguage)) continue
      const key = `${task.sourceLanguage}__${language}`
      const group = groups.get(key) || {
        sourceLanguage: task.sourceLanguage,
        targetLanguage: language,
        rows: [],
      }
      group.rows.push(task)
      groups.set(key, group)
    }
  }

  for (const group of groups.values()) {
    for (let index = 0; index < group.rows.length; index += TRANSLATE_CHUNK_SIZE) {
      const rows = group.rows.slice(index, index + TRANSLATE_CHUNK_SIZE)
      try {
        const translated = await translateBatch(account, {
          sourceLanguage: group.sourceLanguage,
          targetLanguage: group.targetLanguage,
          texts: rows.map((task) => task.sourceText),
        })

        rows.forEach((task, rowIndex) => {
          task.newMap[group.targetLanguage] = normalizeString(translated[rowIndex])
        })
      } catch (error) {
        rows.forEach((task) => {
          task.failures.push({
            targetLanguage: group.targetLanguage,
            message: error instanceof Error ? error.message : String(error),
          })
        })
      }
    }
  }
}

function compareTasks({ bundle, tasks, cacheDocs, targetLanguages }) {
  const cacheByFieldLanguage = buildCacheByFieldLanguage(cacheDocs)

  return tasks.flatMap((task) =>
    targetLanguages.map((language) => {
      const oldInline = normalizeString(task.oldMap[language])
      const oldCache = cacheByFieldLanguage.get(`${task.fieldId}__${language}`) || ''
      const nextText = normalizeString(task.newMap[language])
      return {
        kitchen: normalizeString(bundle.kitchen.slug || bundle.kitchen.name || bundle.kitchen.id),
        menu: normalizeString(bundle.menu.name || bundle.menuSnap.id),
        field: task.kind,
        field_id: task.fieldId,
        source_language: task.sourceLanguage,
        target_language: language,
        source_text: task.sourceText,
        source_repaired_from_map: task.sourceRepairedFromMap,
        old_inline: oldInline,
        old_cache: oldCache,
        old_effective: oldInline || oldCache,
        new_text: nextText,
        changed: (oldInline || oldCache) !== nextText,
        failed: task.failures.some((failure) => failure.targetLanguage === language),
      }
    })
  )
}

function buildCacheByFieldLanguage(cacheDocs) {
  const cacheByFieldLanguage = new Map()
  for (const doc of cacheDocs) {
    const fieldId = normalizeString(doc.data.field_id)
    const language = normalizeLanguageCode(doc.data.target_language)
    const text = normalizeString(doc.data.translated_text)
    if (fieldId && language && text) {
      cacheByFieldLanguage.set(`${fieldId}__${language}`, text)
    }
  }
  return cacheByFieldLanguage
}

function batchSet(map, ref, patch) {
  const key = ref.path
  map.set(key, {
    ref,
    patch: {
      ...(map.get(key)?.patch ?? {}),
      ...patch,
    },
  })
}

async function commitBundle(db, bundle, tasks, targetLanguages) {
  const updateMap = new Map()
  const cacheWrites = []

  for (const task of tasks) {
    const translatedMap = {}
    for (const language of targetLanguages) {
      const text = normalizeString(task.newMap[language])
      if (text) translatedMap[language] = text
    }

    batchSet(updateMap, task.docRef, {
      [task.mapField]: Object.keys(translatedMap).length
        ? translatedMap
        : FieldValue.delete(),
      updated: updatedStamp(),
    })

    for (const language of targetLanguages) {
      const translatedText = normalizeString(task.newMap[language])
      if (!translatedText || !task.sourceText) continue

      const id = cacheDocId(task.fieldId, language)
      if (!id) continue

      cacheWrites.push({
        ref: bundle.menuSnap.ref.collection(CACHE_COLLECTION).doc(id),
        payload: cacheDocPayload({
          id,
          fieldId: task.fieldId,
          sourceLanguage: task.sourceLanguage,
          targetLanguage: language,
          sourceText: task.sourceText,
          translatedText,
          provider:
            normalizeLanguageCode(language) === normalizeLanguageCode(task.sourceLanguage)
              ? 'source'
              : 'google',
        }),
      })
    }
  }

  batchSet(updateMap, bundle.menuSnap.ref, {
    sproochli_refresh_needed: false,
    updated: updatedStamp(),
  })

  const ops = [
    ...bundle.cacheRefs.map((ref) => ({ kind: 'delete', ref })),
    ...Array.from(updateMap.values()).map((entry) => ({
      kind: 'update',
      ref: entry.ref,
      patch: entry.patch,
    })),
    ...cacheWrites.map((entry) => ({
      kind: 'set',
      ref: entry.ref,
      payload: entry.payload,
    })),
  ]

  for (let index = 0; index < ops.length; index += 400) {
    const batch = db.batch()
    for (const op of ops.slice(index, index + 400)) {
      if (op.kind === 'delete') batch.delete(op.ref)
      if (op.kind === 'update') batch.set(op.ref, op.patch, { merge: true })
      if (op.kind === 'set') batch.set(op.ref, op.payload, { merge: false })
    }
    await batch.commit()
  }

  return {
    deleted_cache_docs: bundle.cacheRefs.length,
    updated_docs: updateMap.size,
    written_cache_docs: cacheWrites.length,
  }
}

async function commitSourceRepairTasks(tasks) {
  const updateMap = new Map()

  for (const task of tasks) {
    if (!task.sourceRepairedFromMap || !task.sourceField || !task.sourceText) continue

    batchSet(updateMap, task.docRef, {
      [task.sourceField]: task.sourceText,
      updated: updatedStamp(),
    })
  }

  const ops = Array.from(updateMap.values())
  for (let index = 0; index < ops.length; index += 400) {
    const batch = ops[index].ref.firestore.batch()
    for (const op of ops.slice(index, index + 400)) {
      batch.set(op.ref, op.patch, { merge: true })
    }
    await batch.commit()
  }

  return {
    updated_docs: updateMap.size,
  }
}

async function commitMissingCacheDocs(bundle, tasks, targetLanguages) {
  const cacheByFieldLanguage = buildCacheByFieldLanguage(bundle.cacheDocs)
  const cacheWrites = []

  for (const task of tasks) {
    for (const language of targetLanguages) {
      const oldInline = normalizeString(task.oldMap[language])
      const oldCache = cacheByFieldLanguage.get(`${task.fieldId}__${language}`) || ''
      const translatedText = normalizeString(task.newMap[language])

      if (oldInline || oldCache || !translatedText || !task.sourceText) continue

      const id = cacheDocId(task.fieldId, language)
      if (!id) continue

      cacheWrites.push({
        ref: bundle.menuSnap.ref.collection(CACHE_COLLECTION).doc(id),
        payload: cacheDocPayload({
          id,
          fieldId: task.fieldId,
          sourceLanguage: task.sourceLanguage,
          targetLanguage: language,
          sourceText: task.sourceText,
          translatedText,
          provider:
            normalizeLanguageCode(language) === normalizeLanguageCode(task.sourceLanguage)
              ? 'source'
              : 'google',
        }),
      })
    }
  }

  for (let index = 0; index < cacheWrites.length; index += 400) {
    const batch = bundle.menuSnap.ref.firestore.batch()
    for (const entry of cacheWrites.slice(index, index + 400)) {
      batch.set(entry.ref, entry.payload, { merge: false })
    }
    await batch.commit()
  }

  return {
    written_cache_docs: cacheWrites.length,
  }
}

function modeLabel({ commit, commitMissingCache, commitSourceRepairs, noAi }) {
  if (commitSourceRepairs) return 'commit-source-repairs'
  if (commitMissingCache) return 'commit-missing-cache'
  if (commit) return 'commit'
  return noAi ? 'dry-run-no-ai' : 'dry-run-ai'
}

function markdownReport({ summary, comparisons }) {
  const changed = comparisons.filter((row) => row.changed)
  const failed = comparisons.filter((row) => row.failed)
  const sample = changed.slice(0, 120)

  const rows = sample.map((row) =>
    [
      row.kitchen,
      row.menu,
      row.field,
      row.target_language,
      row.old_effective || '',
      row.new_text || '',
    ]
      .map((value) =>
        normalizeString(value).replace(/\|/g, '\\|').replace(/\n/g, '<br/>')
      )
      .join(' | ')
  )

  return [
    '# Kitchen Menu Sproochli Translation Refresh',
    'Authority: Operational review output',
    `Updated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Summary',
    `- Mode: ${summary.mode}`,
    `- Menus discovered: ${summary.menus_discovered}`,
    `- Translation fields compared: ${summary.fields_compared}`,
    `- Changed rows: ${changed.length}`,
    `- Failed rows: ${failed.length}`,
    `- Gained from blank rows: ${summary.gained_from_blank_rows}`,
    `- Would lose source rows: ${summary.would_lose_source_rows}`,
    `- Source repairs found: ${summary.source_repairs_found}`,
    `- Backup JSON: ${summary.backup_file}`,
    `- Comparison JSON: ${summary.comparison_file}`,
    '',
    '## Changed Sample',
    '| Kitchen | Menu | Field | Language | Old | New |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const commit = args.commit === true
  const commitMissingCache = args['commit-missing-cache'] === true
  const commitSourceRepairs = args['commit-source-repairs'] === true
  if ([commit, commitMissingCache, commitSourceRepairs].filter(Boolean).length > 1) {
    throw new Error(
      'Use only one commit mode: --commit, --commit-missing-cache, or --commit-source-repairs.'
    )
  }

  const noAi = args['no-ai'] === true || commitSourceRepairs
  const allowSourceLoss = args['allow-source-loss'] === true
  const repairEmptySource =
    args['repair-empty-source'] === true || commitSourceRepairs
  const account = await readServiceAccount(
    normalizeString(args['service-account']) || DEFAULT_SERVICE_ACCOUNT_PATH
  )
  const projectId =
    normalizeString(args.project) ||
    getServiceAccountField(account, 'project_id', 'projectId') ||
    DEFAULT_PROJECT_ID
  const databaseId = normalizeString(args.database) || DEFAULT_DATABASE_ID
  const app = initializeApp({ credential: cert(account), projectId }, `menu-refresh:${Date.now()}`)
  const db = getFirestore(app, databaseId)
  const kitchenCollections = unique(
    normalizeString(args['kitchen-collections'] || args['kitchen-collection'])
      ? normalizeString(args['kitchen-collections'] || args['kitchen-collection']).split(',')
      : DEFAULT_KITCHEN_COLLECTIONS
  )
  const runId = timestampId()
  const backupRoot = resolveRepoPath(normalizeString(args['backup-root']) || DEFAULT_BACKUP_ROOT)
  const runDir = join(backupRoot, runId)
  await mkdir(runDir, { recursive: true })

  const discovered = await discoverMenus(db, {
    kitchenCollections,
    kitchenId: normalizeString(args['kitchen-id']),
    menuId: normalizeString(args['menu-id']),
    includeDrafts: args['include-drafts'] === true,
    limit: Number(args.limit || 0) || 0,
  })

  const backup = []
  const comparisons = []
  const commits = []
  const commitJobs = []
  const missingCacheJobs = []
  const sourceRepairJobs = []

  for (const entry of discovered) {
    const bundle = await readMenuBundle(entry)
    bundle.kitchenSnap = entry.kitchenSnap
    bundle.menuSnap = entry.menuSnap
    const tasks = buildTasks(bundle, { repairEmptySource })
    const inlineMaps = tasks.map((task) => task.oldMap)
    const targetLanguages = collectLanguages({
      kitchen: bundle.kitchen,
      menu: bundle.menu,
      cacheDocs: bundle.cacheDocs,
      inlineMaps,
    })

    await translateTasks(account, tasks, targetLanguages, noAi)

    backup.push({
      kitchen_collection_path: entry.kitchenCollectionPath,
      kitchen: plainDoc(entry.kitchenSnap),
      menu: plainDoc(entry.menuSnap),
      sections: bundle.sections.map(plainDoc),
      dishes: bundle.dishes.map(plainDoc),
      translation_cache: bundle.cacheDocs,
      target_languages: targetLanguages,
    })
    comparisons.push(
      ...compareTasks({
        bundle,
        tasks,
        cacheDocs: bundle.cacheDocs,
        targetLanguages,
      })
    )

    if (commit) commitJobs.push({ bundle, tasks, targetLanguages })
    if (commitMissingCache) missingCacheJobs.push({ bundle, tasks, targetLanguages })
    if (commitSourceRepairs) sourceRepairJobs.push({ tasks })
  }

  const backupFile = join(runDir, 'backup.json')
  const comparisonFile = join(runDir, 'comparison.json')
  const reportFile = join(runDir, 'report.md')
  const sourceLossRows = comparisons.filter(
    (row) => row.old_effective && !row.new_text && !row.source_text
  )
  const sourceRepairCount = new Set(
    comparisons
      .filter((row) => row.source_repaired_from_map)
      .map((row) => `${row.field_id}__${row.field}`)
  ).size
  const summary = {
    mode: modeLabel({ commit, commitMissingCache, commitSourceRepairs, noAi }),
    run_id: runId,
    kitchen_collections: kitchenCollections,
    menus_discovered: discovered.length,
    fields_compared: comparisons.length,
    changed_rows: comparisons.filter((row) => row.changed).length,
    failed_rows: comparisons.filter((row) => row.failed).length,
    gained_from_blank_rows: comparisons.filter(
      (row) => !row.old_effective && row.new_text
    ).length,
    would_lose_source_rows: sourceLossRows.length,
    source_repairs_found: sourceRepairCount,
    backup_file: backupFile,
    comparison_file: comparisonFile,
    report_file: reportFile,
    commits,
  }

  await writeFile(backupFile, jsonStringify({ summary, backup }) + '\n')
  await writeFile(comparisonFile, jsonStringify({ summary, comparisons }) + '\n')
  await writeFile(reportFile, markdownReport({ summary, comparisons }) + '\n')

  if (commit && sourceLossRows.length && !allowSourceLoss) {
    throw new Error(
      [
        `Refusing commit: ${sourceLossRows.length} rows would lose old translation text because the canonical source field is empty.`,
        `Repair source fields first or rerun with --allow-source-loss after manual review.`,
        `Comparison file: ${comparisonFile}`,
      ].join('\n')
    )
  }

  if (commit) {
    for (const job of commitJobs) {
      commits.push(await commitBundle(db, job.bundle, job.tasks, job.targetLanguages))
    }

    await writeFile(backupFile, jsonStringify({ summary, backup }) + '\n')
    await writeFile(comparisonFile, jsonStringify({ summary, comparisons }) + '\n')
    await writeFile(reportFile, markdownReport({ summary, comparisons }) + '\n')
  }

  if (commitSourceRepairs) {
    for (const job of sourceRepairJobs) {
      commits.push(await commitSourceRepairTasks(job.tasks))
    }

    await writeFile(backupFile, jsonStringify({ summary, backup }) + '\n')
    await writeFile(comparisonFile, jsonStringify({ summary, comparisons }) + '\n')
    await writeFile(reportFile, markdownReport({ summary, comparisons }) + '\n')
  }

  if (commitMissingCache) {
    for (const job of missingCacheJobs) {
      commits.push(
        await commitMissingCacheDocs(job.bundle, job.tasks, job.targetLanguages)
      )
    }

    await writeFile(backupFile, jsonStringify({ summary, backup }) + '\n')
    await writeFile(comparisonFile, jsonStringify({ summary, comparisons }) + '\n')
    await writeFile(reportFile, markdownReport({ summary, comparisons }) + '\n')
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
