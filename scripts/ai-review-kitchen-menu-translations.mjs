#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_ENV_PATHS = [
  'projects/fireux/sproochli/.env',
  'projects/misebox/misebox-app/.env',
]
const DEFAULT_OUTPUT_ROOT = 'temp/ai-menu-translation-review'
const DEFAULT_MODEL = 'gpt-4o-mini'
const MAX_FIELDS_PER_CALL = 80

const args = parseArgs(process.argv.slice(2))
const projectId = text(args.project || DEFAULT_PROJECT_ID)
const databaseId = text(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = text(args['service-account'] || DEFAULT_SERVICE_ACCOUNT_PATH)
const kitchenIdFilter = text(args['kitchen-id'])
const menuIdFilter = text(args['menu-id'])
const limit = Number(args.limit || 0) || 0
const languagesFilter = csv(args.languages)
const outputRoot = text(args['output-root'] || DEFAULT_OUTPUT_ROOT)
const includeRoot = flag(args['include-root'], true)
const includeAppScoped = flag(args['include-app-scoped'], true)
const noAi = flag(args['no-ai'], false)
const requestTimeoutMs = Math.max(10_000, Number(args['timeout-ms'] || 45_000))
const verbose = flag(args.verbose, false)

function text(value) {
  return String(value ?? '').trim()
}

function lower(value) {
  return text(value).toLowerCase()
}

function csv(value) {
  return text(value)
    .split(',')
    .map((entry) => lower(entry))
    .filter(Boolean)
}

function flag(value, fallback) {
  if (value === undefined) return fallback
  if (value === true || value === false) return value

  const normalized = lower(value)
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true

  return fallback
}

function normalizeCompare(value) {
  return text(value)
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

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

const repoRoot = findMonorepoRoot(process.cwd())

function repoPath(pathValue) {
  return isAbsolute(pathValue) ? pathValue : resolve(repoRoot, pathValue)
}

function readEnvLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const eq = trimmed.indexOf('=')
  if (eq <= 0) return null

  return [
    trimmed.slice(0, eq).trim(),
    trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, ''),
  ]
}

async function readEnv(paths) {
  const env = {}
  for (const pathValue of paths) {
    const resolved = repoPath(pathValue)
    if (!existsSync(resolved)) continue
    const content = await readFile(resolved, 'utf8')
    for (const line of content.split(/\r?\n/g)) {
      const parsed = readEnvLine(line)
      if (parsed) env[parsed[0]] = parsed[1]
    }
  }
  return env
}

function normalizeLookup(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s*[/|]\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s/|:;,.–—-]+|[\s/|:;,.–—-]+$/g, '')
}

async function readGlossary() {
  const path = repoPath('scripts/data/restaurant-translation-glossary.seed.json')
  const json = JSON.parse(await readFile(path, 'utf8'))
  return Array.isArray(json.entries) ? json.entries : []
}

function record(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function translationRecordText(value) {
  if (typeof value === 'string' || typeof value === 'number') return text(value)
  const item = record(value)
  return text(item.text || item.value || item.label || item.name || item.description)
}

function mapTranslation(translations, language) {
  return translationRecordText(record(translations)[language])
}

function fieldKind(fieldId) {
  if (/^menu:[^:]+:name$/.test(fieldId)) return 'menu_name'
  if (/^menu:[^:]+:description$/.test(fieldId)) return 'menu_description'
  if (/^section:[^:]+:label$/.test(fieldId)) return 'section_label'
  if (/^section:[^:]+:description$/.test(fieldId)) return 'section_description'
  if (/^dish:[^:]+:name$/.test(fieldId)) return 'dish_name'
  if (/^dish:[^:]+:description$/.test(fieldId)) return 'dish_description'
  return 'menu_field'
}

function glossaryHints(glossary, sourceText, language) {
  const sourceKey = normalizeLookup(sourceText)
  if (!sourceKey) return []

  return glossary
    .filter((entry) => {
      const translations = record(entry.translations)
      const values = [
        entry.source_text,
        ...(Array.isArray(entry.aliases) ? entry.aliases : []),
        ...Object.values(translations),
      ]
      return values.some((value) => normalizeLookup(value) === sourceKey)
    })
    .map((entry) => {
      const translations = record(entry.translations)
      return {
        sourceText: text(entry.source_text),
        aliases: Array.isArray(entry.aliases) ? entry.aliases.map(text).filter(Boolean) : [],
        suggestedTranslation: text(translations[language]),
      }
    })
    .filter((entry) => entry.sourceText || entry.suggestedTranslation)
}

function languageSetFromMaps(...values) {
  const out = new Set()
  for (const value of values) {
    for (const key of Object.keys(record(value))) {
      const language = lower(key)
      if (language) out.add(language)
    }
  }
  return out
}

function cacheDocId(fieldId, targetLanguage) {
  const hash = createHash('sha256')
    .update([fieldId, targetLanguage].join('\n'), 'utf8')
    .digest('hex')
  return `${targetLanguage}__${hash.slice(0, 40)}`
}

async function readServiceAccount(pathValue) {
  const resolved = repoPath(pathValue)
  if (!existsSync(resolved)) throw new Error(`Service account not found: ${pathValue}`)
  return JSON.parse(await readFile(resolved, 'utf8'))
}

function appScopeOf(path) {
  const parts = path.split('/')
  return parts[0] === 'apps' ? parts[1] : 'root'
}

function shouldIncludeKitchenPath(path) {
  if (path.startsWith('apps/') && !includeAppScoped) return false
  if (path.startsWith('kitchens/') && !includeRoot) return false
  return path.includes('/kitchens/') || path.startsWith('kitchens/')
}

async function discoverMenus(db) {
  const snap = await db.collectionGroup('menus').get()
  const menus = []

  for (const doc of snap.docs) {
    const kitchenRef = doc.ref.parent.parent
    if (!kitchenRef) continue
    if (!shouldIncludeKitchenPath(kitchenRef.path)) continue
    if (kitchenIdFilter && kitchenRef.id !== kitchenIdFilter) continue
    if (menuIdFilter && doc.id !== menuIdFilter) continue

    const data = doc.data() || {}
    if (text(data.status) && text(data.status) !== 'published') continue

    menus.push({
      menuRef: doc.ref,
      menuSnap: doc,
      menu: { id: doc.id, ...data },
      kitchenRef,
      scope: appScopeOf(kitchenRef.path),
    })
  }

  menus.sort((a, b) => a.menuRef.path.localeCompare(b.menuRef.path))
  return limit ? menus.slice(0, limit) : menus
}

async function readMenuBundle(entry) {
  const kitchenSnap = await entry.kitchenRef.get()
  const kitchen = kitchenSnap.data() || {}
  const sectionSnaps = await entry.menuRef.collection('sections').get()
  const sections = sectionSnaps.docs
    .map((doc) => ({ id: doc.id, ref: doc.ref, data: doc.data() || {} }))
    .filter((section) => text(section.data.status) !== 'archived')
    .sort((a, b) => Number(a.data.sort_order || 0) - Number(b.data.sort_order || 0))
  const itemSnaps = await Promise.all(
    sections.map((section) => section.ref.collection('items').get())
  )
  const items = itemSnaps.flatMap((snap) =>
    snap.docs
      .map((doc) => ({ id: doc.id, data: doc.data() || {} }))
      .filter((item) => text(item.data.status) !== 'archived')
  )
  const dishIds = [...new Set(items.map((item) => text(item.data.dish_id)).filter(Boolean))]
  const dishSnaps = await Promise.all(
    dishIds.map((dishId) => entry.kitchenRef.collection('dishes').doc(dishId).get())
  )
  const dishes = dishSnaps
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, data: doc.data() || {} }))
  const cacheSnap = await entry.menuRef.collection('translation_cache').get()
  const cache = new Map()
  const cacheDocs = []

  cacheSnap.forEach((doc) => {
    const data = doc.data() || {}
    const fieldId = text(data.field_id)
    const language = lower(data.target_language)
    const value = text(data.translated_text)
    if (fieldId && language && value) cache.set(`${language}:${fieldId}`, data)
    cacheDocs.push({ id: doc.id, data })
  })

  return {
    ...entry,
    kitchen: { id: entry.kitchenRef.id, ...kitchen },
    sections,
    dishes,
    cache,
    cacheDocs,
  }
}

function addField(fields, input) {
  const sourceText = text(input.sourceText)
  const fieldId = text(input.id)
  if (!fieldId || !sourceText) return

  fields.push({
    id: fieldId,
    kind: fieldKind(fieldId),
    sourceText,
    sourceLanguage: lower(input.sourceLanguage) || 'mixed',
    translations: record(input.translations),
    sourcePath: input.sourcePath,
  })
}

function fieldsForBundle(bundle) {
  const menu = bundle.menu
  const menuSourceLanguage = lower(menu.source_language) || 'mixed'
  const fields = []

  addField(fields, {
    id: `menu:${menu.id}:name`,
    sourceText: menu.name,
    sourceLanguage: menuSourceLanguage,
    translations: menu.names || menu.translations,
    sourcePath: bundle.menuRef.path,
  })
  addField(fields, {
    id: `menu:${menu.id}:description`,
    sourceText: menu.description,
    sourceLanguage: menuSourceLanguage,
    translations: menu.descriptions,
    sourcePath: bundle.menuRef.path,
  })

  for (const section of bundle.sections) {
    addField(fields, {
      id: `section:${section.id}:label`,
      sourceText: section.data.label,
      sourceLanguage: menuSourceLanguage,
      translations: section.data.labels || section.data.translations,
      sourcePath: section.ref.path,
    })
    addField(fields, {
      id: `section:${section.id}:description`,
      sourceText: section.data.description,
      sourceLanguage: menuSourceLanguage,
      translations: section.data.descriptions,
      sourcePath: section.ref.path,
    })
  }

  for (const dish of bundle.dishes) {
    const dishSourceLanguage = lower(dish.data.source_language) || menuSourceLanguage
    addField(fields, {
      id: `dish:${dish.id}:name`,
      sourceText: dish.data.name,
      sourceLanguage: dishSourceLanguage,
      translations: dish.data.names,
      sourcePath: `${bundle.kitchenRef.path}/dishes/${dish.id}`,
    })
    addField(fields, {
      id: `dish:${dish.id}:description`,
      sourceText: dish.data.description,
      sourceLanguage: dishSourceLanguage,
      translations: dish.data.descriptions,
      sourcePath: `${bundle.kitchenRef.path}/dishes/${dish.id}`,
    })
  }

  return fields
}

function targetLanguagesForBundle(bundle, fields) {
  if (languagesFilter.length) return languagesFilter

  const languages = new Set()
  const settings = record(bundle.kitchen.language_settings)
  for (const key of ['public_languages', 'attached_languages', 'cache_languages']) {
    const value = settings[key]
    if (Array.isArray(value)) value.map(lower).filter(Boolean).forEach((lang) => languages.add(lang))
  }
  for (const doc of bundle.cacheDocs) {
    const language = lower(doc.data.target_language)
    if (language) languages.add(language)
  }
  for (const field of fields) {
    languageSetFromMaps(field.translations).forEach((lang) => languages.add(lang))
  }

  return [...languages].filter(Boolean).sort()
}

function oldEffectiveFor(bundle, field, language) {
  const cached = bundle.cache.get(`${language}:${field.id}`)
  const cacheText = text(cached?.translated_text)
  if (cacheText) return { value: cacheText, source: 'cache', provider: text(cached?.provider) }

  const attached = mapTranslation(field.translations, language)
  if (attached) return { value: attached, source: 'attached', provider: 'attached' }

  if (language === lower(field.sourceLanguage)) {
    return { value: field.sourceText, source: 'source', provider: 'source' }
  }

  return { value: '', source: 'missing', provider: '' }
}

function outputTextFromOpenAiPayload(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text
  const parts = []
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === 'string') parts.push(content.text)
    }
  }
  return parts.join('\n').trim()
}

function parseAiJson(raw) {
  const trimmed = text(raw)
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    return null
  }
}

async function translateWithAi(input) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      input: [
        {
          role: 'system',
          content: [
            'You translate restaurant menu content.',
            'Use menu context; do not translate Karte as map when it is a menu title.',
            'Preserve dish names, names in quotes, and brand/place names when appropriate.',
            'Return strict JSON only: {"translations":[{"fieldId":"...","text":"..."}]}.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify(input.payload, null, 2),
        },
      ],
    }),
  }).finally(() => clearTimeout(timeout))
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenAI status ${response.status}`)
  }
  const parsed = parseAiJson(outputTextFromOpenAiPayload(payload))
  const translations = Array.isArray(parsed?.translations) ? parsed.translations : []

  return translations.map((entry) => ({
    fieldId: text(entry.fieldId || entry.id),
    text: text(entry.text || entry.translation),
  }))
}

function markdownReport(summary, menuReports, diffRows) {
  const lines = [
    '# AI Menu Translation Review',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Menus processed: ${summary.menus_processed}`,
    `- Menu/language calls: ${summary.calls}`,
    `- Fields reviewed: ${summary.fields_reviewed}`,
    `- Diff rows: ${summary.diff_rows}`,
    `- Failed calls: ${summary.failed_calls}`,
    '',
  ]

  for (const report of menuReports) {
    lines.push(
      `## ${report.kitchenName} / ${report.menuName}`,
      '',
      `- Scope: \`${report.scope}\``,
      `- Menu path: \`${report.menuPath}\``,
      `- Languages: ${report.languages.join(', ') || 'none'}`,
      `- Diffs: ${report.diffCount}`,
      ''
    )

    const rows = diffRows.filter((row) => row.menuPath === report.menuPath)
    if (!rows.length) {
      lines.push('No diffs.', '')
      continue
    }

    lines.push('| Language | Field | Source | Current | AI | Current source |')
    lines.push('| --- | --- | --- | --- | --- | --- |')
    for (const row of rows) {
      lines.push(
        `| ${md(row.language)} | ${md(row.fieldId)} | ${md(row.sourceText)} | ${md(row.currentText)} | ${md(row.aiText)} | ${md(row.currentSource)} |`
      )
    }
    lines.push('')
  }

  return lines.join('\n')
}

function md(value) {
  const out = text(value) || '—'
  return out.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

async function main() {
  const env = await readEnv(DEFAULT_ENV_PATHS)
  const apiKey = process.env.FIREUX_AI_API_KEY || env.FIREUX_AI_API_KEY
  const model = process.env.FIREUX_AI_MODEL || env.FIREUX_AI_MODEL || DEFAULT_MODEL

  if (!noAi && !apiKey) {
    throw new Error('FIREUX_AI_API_KEY is required for AI review.')
  }

  const serviceAccount = await readServiceAccount(serviceAccountPath)
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  })
  const db = getFirestore(app, databaseId)
  const glossary = await readGlossary()
  const menus = await discoverMenus(db)
  const runDir = repoPath(join(outputRoot, `run-${Date.now()}`))
  const diffRows = []
  const menuReports = []
  const failures = []
  let calls = 0
  let fieldsReviewed = 0

  await mkdir(runDir, { recursive: true })
  const jsonFile = join(runDir, 'comparison.json')
  const reportFile = join(runDir, 'report.md')
  const summary = () => ({
    projectId,
    databaseId,
    model: noAi ? null : model,
    no_ai: noAi,
    menus_discovered: menus.length,
    menus_processed: menuReports.length,
    calls,
    fields_reviewed: fieldsReviewed,
    diff_rows: diffRows.length,
    failed_calls: failures.length,
  })
  const writeOutputs = async () => {
    const currentSummary = summary()
    const output = {
      summary: currentSummary,
      menus: menuReports,
      diffs: diffRows,
      failures,
    }

    await writeFile(jsonFile, JSON.stringify(output, null, 2))
    await writeFile(reportFile, markdownReport(currentSummary, menuReports, diffRows))
  }

  for (const entry of menus) {
    let bundle
    let fields = []
    let languages = []
    const menuDiffStart = diffRows.length

    try {
      bundle = await readMenuBundle(entry)
      fields = fieldsForBundle(bundle)
      languages = targetLanguagesForBundle(bundle, fields)
    } catch (error) {
      failures.push({
        menuPath: entry.menuRef.path,
        language: '*',
        message: error instanceof Error ? error.message : String(error),
      })
      await writeOutputs()
      continue
    }

    if (verbose) {
      console.error('[ai-review] menu', {
        path: bundle.menuRef.path,
        languages,
        fields: fields.length,
      })
    }

    for (const language of languages) {
      const sourceFields = fields.filter((field) => language !== lower(field.sourceLanguage))
      for (let index = 0; index < sourceFields.length; index += MAX_FIELDS_PER_CALL) {
        const batch = sourceFields.slice(index, index + MAX_FIELDS_PER_CALL)
        if (!batch.length) continue

        fieldsReviewed += batch.length
        calls += 1

        if (verbose) {
          console.error('[ai-review] call', {
            call: calls,
            menu: bundle.menuRef.path,
            language,
            fields: batch.length,
          })
        }

        const payload = {
          domain: 'restaurant_menu',
          kitchen: {
            id: bundle.kitchen.id,
            name: text(bundle.kitchen.name || bundle.kitchen.display_name),
          },
          menu: {
            id: bundle.menu.id,
            name: text(bundle.menu.name),
            description: text(bundle.menu.description),
          },
          targetLanguage: language,
          sourceLanguagePolicy:
            'Source copy may be mixed-language restaurant menu text. Infer meaning from menu context.',
          fields: batch.map((field) => ({
            fieldId: field.id,
            kind: field.kind,
            sourceLanguage: field.sourceLanguage,
            sourceText: field.sourceText,
            current: oldEffectiveFor(bundle, field, language),
            glossaryHints: glossaryHints(glossary, field.sourceText, language),
          })),
        }

        if (noAi) continue

        try {
          const translations = await translateWithAi({
            apiKey,
            model,
            payload,
          })
          const translationById = new Map(
            translations.map((entry) => [entry.fieldId, entry.text])
          )

          for (const field of batch) {
            const aiText = text(translationById.get(field.id))
            if (!aiText) continue

            const current = oldEffectiveFor(bundle, field, language)
            if (normalizeCompare(current.value) === normalizeCompare(aiText)) continue

            diffRows.push({
              scope: bundle.scope,
              kitchenId: bundle.kitchen.id,
              kitchenName: text(bundle.kitchen.name || bundle.kitchen.display_name),
              menuId: bundle.menu.id,
              menuName: text(bundle.menu.name),
              menuPath: bundle.menuRef.path,
              language,
              fieldId: field.id,
              cacheDocId: cacheDocId(field.id, language),
              kind: field.kind,
              sourceText: field.sourceText,
              currentText: current.value,
              currentSource: current.source,
              currentProvider: current.provider,
              aiText,
              sourcePath: field.sourcePath,
            })
          }
        } catch (error) {
          failures.push({
            menuPath: bundle.menuRef.path,
            language,
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    menuReports.push({
      scope: bundle.scope,
      kitchenId: bundle.kitchen.id,
      kitchenName: text(bundle.kitchen.name || bundle.kitchen.display_name) || bundle.kitchen.id,
      menuId: bundle.menu.id,
      menuName: text(bundle.menu.name) || bundle.menu.id,
      menuPath: bundle.menuRef.path,
      languages,
      fieldCount: fields.length,
      diffCount: diffRows.length - menuDiffStart,
    })
    await writeOutputs()
  }

  await writeOutputs()
  const finalSummary = summary()

  console.log(JSON.stringify({
    ...finalSummary,
    output: {
      json: jsonFile,
      report: reportFile,
    },
    preview_diffs: diffRows.slice(0, 12).map((row) => ({
      menu: `${row.kitchenName} / ${row.menuName}`,
      language: row.language,
      fieldId: row.fieldId,
      current: row.currentText,
      ai: row.aiText,
    })),
    failures: failures.slice(0, 5),
  }, null, 2))
}

main().catch((error) => {
  console.error('[ai-review-kitchen-menu-translations] failed')
  console.error(error)
  process.exit(1)
})
