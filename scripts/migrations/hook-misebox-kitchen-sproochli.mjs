#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const SYSTEM_ACTOR = 'system:hook-misebox-kitchen-sproochli'

const TARGETS = {
  luna: {
    label: 'Luna Piccante',
    kitchenId: 'ChIJ93_ggY-jj0cRTCyLcfBuK2w',
    slug: 'luna-picante',
    appId: 'misebox-app',
    appScopeState: 'parent_app',
    menuIds: ['main', 'pizza'],
    attachedLanguages: ['de', 'en', 'it'],
    cacheLanguages: ['fr', 'ar'],
    publicLanguages: ['de', 'en', 'it', 'fr', 'ar'],
    legacyAppIds: [],
  },
  'la-tapberne': {
    label: 'La Tapberne',
    kitchenId: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
    slug: 'la-tapberne',
    appId: 'la-tap-berne',
    appScopeState: 'dedicated_app',
    menuIds: ['main'],
    attachedLanguages: ['de', 'en', 'es', 'pt'],
    cacheLanguages: ['fr', 'it', 'ar', 'he', 'ko', 'ja', 'bo'],
    publicLanguages: ['de', 'en', 'es', 'pt', 'fr', 'it', 'ar', 'he', 'ko', 'ja', 'bo'],
    legacyAppIds: ['misebox-app'],
  },
}

const clean = (value) => String(value ?? '').trim()
const unique = (values) => [...new Set(values.map(clean).filter(Boolean))]
const splitList = (value) =>
  clean(value)
    .split(',')
    .map((entry) => clean(entry))
    .filter(Boolean)

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)
const only = new Set(splitList(args.only))
const selectedTargets = Object.entries(TARGETS).filter(([key]) =>
  only.size ? only.has(key) : true
)

if (args.help || args.h) {
  console.log(`
Hook Misebox Kitchen public menus into Sproochli.

Dry-run by default. Pass --commit to write.

This script:
  - enables kitchen.sproochli_enabled on root and app Kitchen records
  - writes canonical language_settings lists
  - copies missing translation_cache docs into the current app-scoped Menu path

Usage:
  node scripts/migrations/hook-misebox-kitchen-sproochli.mjs [--commit]

Options:
  --only <csv>              Optional target keys: luna,la-tapberne
  --project <id>            Firebase project id. Defaults to ${DEFAULT_PROJECT_ID}.
  --database <id>           Firestore database id. Defaults to ${DEFAULT_DATABASE_ID}.
  --service-account <path>  Service account JSON path.
`)
  process.exit(0)
}

if (!selectedTargets.length) {
  throw new Error(`No targets selected. Known targets: ${Object.keys(TARGETS).join(', ')}`)
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `hook-misebox-kitchen-sproochli-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

let batch = db.batch()
let batchOps = 0

async function flush() {
  if (!commit || batchOps === 0) return

  await batch.commit()
  batch = db.batch()
  batchOps = 0
}

async function queueSet(ref, payload, options = { merge: true }) {
  if (!commit) return

  batch.set(ref, payload, options)
  batchOps += 1
  if (batchOps >= 400) await flush()
}

function stamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
  }
}

function createdStamp(appId, existingCreated) {
  const existing = existingCreated && typeof existingCreated === 'object' && !Array.isArray(existingCreated)
    ? existingCreated
    : {}

  return {
    ...existing,
    app_id: appId,
  }
}

function languageSettingsPatch(target, currentSettings) {
  const current =
    currentSettings && typeof currentSettings === 'object' && !Array.isArray(currentSettings)
      ? currentSettings
      : {}

  return {
    ...current,
    attached_languages: unique(target.attachedLanguages),
    cache_languages: unique(target.cacheLanguages),
    public_languages: unique(target.publicLanguages),
  }
}

function kitchenPatch(target, currentData) {
  const current = currentData || {}
  const slug = clean(current.slug) || target.slug

  return {
    id: target.kitchenId,
    slug,
    sproochli_enabled: true,
    language_settings: languageSettingsPatch(target, current.language_settings),
    supported_languages: unique(target.publicLanguages),
    app_scope_state: target.appScopeState,
    app_scope_app_id: target.appId,
    updated: stamp(),
  }
}

function targetMenuRef(target, menuId) {
  return db
    .collection('apps')
    .doc(target.appId)
    .collection('kitchens')
    .doc(target.kitchenId)
    .collection('menus')
    .doc(menuId)
}

function sourceMenuRefs(target, menuId) {
  const sources = [
    {
      label: 'root',
      ref: db.collection('kitchens').doc(target.kitchenId).collection('menus').doc(menuId),
    },
  ]

  for (const appId of target.legacyAppIds) {
    sources.push({
      label: `legacy-app:${appId}`,
      ref: db
        .collection('apps')
        .doc(appId)
        .collection('kitchens')
        .doc(target.kitchenId)
        .collection('menus')
        .doc(menuId),
    })
  }

  return sources
}

async function copyMissingCacheDocs(target, menuId) {
  const menuRef = targetMenuRef(target, menuId)
  const menuSnap = await menuRef.get()
  const targetCacheRef = menuRef.collection('translation_cache')
  const targetCacheSnap = await targetCacheRef.get()
  const existingIds = new Set(targetCacheSnap.docs.map((doc) => doc.id))
  const sourceReports = []
  const copied = []

  for (const source of sourceMenuRefs(target, menuId)) {
    const sourceMenuSnap = await source.ref.get()
    const sourceCacheRef = source.ref.collection('translation_cache')
    const sourceCacheSnap = sourceMenuSnap.exists
      ? await sourceCacheRef.get()
      : { docs: [], size: 0 }
    const missingDocs = sourceCacheSnap.docs.filter((doc) => !existingIds.has(doc.id))

    sourceReports.push({
      label: source.label,
      menuPath: source.ref.path,
      menuExists: sourceMenuSnap.exists,
      cachePath: sourceCacheRef.path,
      cacheCount: sourceCacheSnap.size,
      missingInTarget: missingDocs.length,
    })

    for (const docSnap of missingDocs) {
      const data = docSnap.data() || {}
      const payload = {
        ...data,
        created: createdStamp(target.appId, data.created),
        updated: stamp(),
        copied: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
          from: docSnap.ref.path,
        },
      }

      await queueSet(targetCacheRef.doc(docSnap.id), payload, { merge: false })
      existingIds.add(docSnap.id)
      copied.push({
        id: docSnap.id,
        from: docSnap.ref.path,
        to: targetCacheRef.doc(docSnap.id).path,
      })
    }
  }

  return {
    menuId,
    targetMenuPath: menuRef.path,
    targetMenuExists: menuSnap.exists,
    targetCachePath: targetCacheRef.path,
    targetCacheBefore: targetCacheSnap.size,
    sourceReports,
    plannedCopy: copied.length,
    sampleCopied: copied.slice(0, 12),
  }
}

async function hookTarget(key, target) {
  const rootRef = db.collection('kitchens').doc(target.kitchenId)
  const appRef = db
    .collection('apps')
    .doc(target.appId)
    .collection('kitchens')
    .doc(target.kitchenId)
  const [rootSnap, appSnap] = await Promise.all([rootRef.get(), appRef.get()])
  const rootData = rootSnap.exists ? rootSnap.data() || {} : {}
  const appData = appSnap.exists ? appSnap.data() || {} : {}
  const rootPatch = kitchenPatch(target, rootData)
  const appPatch = kitchenPatch(target, {
    ...rootData,
    ...appData,
    language_settings: appData.language_settings || rootData.language_settings,
  })
  const menus = []

  await queueSet(rootRef, rootPatch)
  await queueSet(appRef, appPatch)

  for (const menuId of target.menuIds) {
    menus.push(await copyMissingCacheDocs(target, menuId))
  }

  return {
    key,
    label: target.label,
    appId: target.appId,
    kitchenId: target.kitchenId,
    root: {
      path: rootRef.path,
      exists: rootSnap.exists,
      sproochliEnabledBefore: rootData.sproochli_enabled === true,
      patch: rootPatch,
    },
    app: {
      path: appRef.path,
      exists: appSnap.exists,
      sproochliEnabledBefore: appData.sproochli_enabled === true,
      patch: appPatch,
    },
    menus,
  }
}

const results = []
for (const [key, target] of selectedTargets) {
  results.push(await hookTarget(key, target))
}
await flush()

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId,
      commit,
      serviceAccount: serviceAccountPath,
      targets: selectedTargets.map(([key]) => key),
      results,
    },
    null,
    2
  )
)
