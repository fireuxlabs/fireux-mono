#!/usr/bin/env node
/*
  Backfill root facade app-scope metadata for root-plus-app entity families.

  What it does:
  - scans root collections:
      projects, kitchens, suppliers, portfolios
  - scans app overlays:
      apps/{appId}/{collection}/{entityId}
  - writes explicit root fields:
      app_scope_state: root_only | parent_app | dedicated_app
      app_scope_app_id: string
  - migrates app overlays away from legacy access hints:
      admin_ids -> team_ids
      delete admin_ids
      delete console_enabled
  - removes supplier root duplicate identity/display props:
      supplier_id, source_supplier_id, name, short_name

  Usage:
    node scripts/migrate-app-scope-state.mjs \
      --service-account packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json \
      --database fireux

    node scripts/migrate-app-scope-state.mjs \
      --service-account packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json \
      --database fireux \
      --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import {
  FieldValue,
  Timestamp,
  getFirestore,
} from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'fireux'
const MIGRATION_ACTOR = 'system:migrate-app-scope-state'
const DELETE_FIELD = FieldValue.delete()

const FAMILIES = {
  projects: {
    collectionPath: 'projects',
    testCollectionPath: 'test-projects',
  },
  kitchens: {
    collectionPath: 'kitchens',
    testCollectionPath: 'test-kitchens',
  },
  suppliers: {
    collectionPath: 'suppliers',
    testCollectionPath: 'test-suppliers',
  },
  portfolios: {
    collectionPath: 'portfolios',
    testCollectionPath: 'test-portfolios',
  },
}

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function asStringArray(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => normalizeString(value)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
}

function hasOwn(data, key) {
  return Object.prototype.hasOwnProperty.call(data ?? {}, key)
}

function hasPatch(patch) {
  return Object.keys(patch).length > 0
}

function describePatch(patch) {
  const described = {}
  for (const [key, value] of Object.entries(patch)) {
    described[key] =
      value === DELETE_FIELD ? '[delete]' : value
  }
  return described
}

function isDedicatedApp(rootId, rootData, appId) {
  const runtimeAppId = normalizeString(rootData?.app_id)
  return Boolean(
    appId &&
      ((runtimeAppId && runtimeAppId === appId) || appId === `${rootId}-app`)
  )
}

function resolveAppScope(familyKey, rootId, rootData, overlayAppIds) {
  const sortedOverlayAppIds = uniqueSorted(overlayAppIds)
  const dedicatedOverlayAppId = sortedOverlayAppIds.find((appId) =>
    isDedicatedApp(rootId, rootData, appId)
  )

  if (dedicatedOverlayAppId) {
    return {
      app_scope_state: 'dedicated_app',
      app_scope_app_id: dedicatedOverlayAppId,
    }
  }

  if (sortedOverlayAppIds.length) {
    return {
      app_scope_state: 'parent_app',
      app_scope_app_id: sortedOverlayAppIds[0],
    }
  }

  const runtimeAppId = normalizeString(rootData?.app_id)
  if (familyKey === 'projects' && runtimeAppId) {
    return {
      app_scope_state: 'dedicated_app',
      app_scope_app_id: runtimeAppId,
    }
  }

  return {
    app_scope_state: 'root_only',
    app_scope_app_id: '',
  }
}

function buildRootPatch(familyKey, rootId, rootData, overlayAppIds) {
  const patch = {}
  const appScope = resolveAppScope(familyKey, rootId, rootData, overlayAppIds)

  if (rootData.app_scope_state !== appScope.app_scope_state) {
    patch.app_scope_state = appScope.app_scope_state
  }

  if (rootData.app_scope_app_id !== appScope.app_scope_app_id) {
    patch.app_scope_app_id = appScope.app_scope_app_id
  }

  if (hasOwn(rootData, 'admin_ids')) {
    patch.admin_ids = DELETE_FIELD
  }

  if (hasOwn(rootData, 'console_enabled')) {
    patch.console_enabled = DELETE_FIELD
  }

  if (familyKey === 'suppliers') {
    const legacyName = normalizeString(rootData.name)
    const canonicalName = normalizeString(rootData.supplier_organization_name)
    if (legacyName && !canonicalName) {
      patch.supplier_organization_name = legacyName
    }

    for (const key of [
      'supplier_id',
      'source_supplier_id',
      'name',
      'short_name',
    ]) {
      if (hasOwn(rootData, key)) {
        patch[key] = DELETE_FIELD
      }
    }
  }

  if (hasPatch(patch)) {
    patch.updated = {
      at: Timestamp.now(),
      by: MIGRATION_ACTOR,
    }
  }

  return patch
}

function buildOverlayPatch(overlayData) {
  const patch = {}
  const teamIds = uniqueSorted([
    ...asStringArray(overlayData.team_ids),
    ...asStringArray(overlayData.admin_ids),
  ])

  if (
    teamIds.length &&
    JSON.stringify(asStringArray(overlayData.team_ids).sort()) !==
      JSON.stringify(teamIds)
  ) {
    patch.team_ids = teamIds
  }

  if (!Array.isArray(overlayData.join_requests)) {
    patch.join_requests = []
  }

  if (hasOwn(overlayData, 'admin_ids')) {
    patch.admin_ids = DELETE_FIELD
  }

  if (hasOwn(overlayData, 'console_enabled')) {
    patch.console_enabled = DELETE_FIELD
  }

  if (hasPatch(patch)) {
    patch.updated = {
      at: Timestamp.now(),
      by: MIGRATION_ACTOR,
    }
  }

  return patch
}

async function loadServiceAccount(pathLike) {
  const resolvedPath = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolvedPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return {
    resolvedPath,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

async function loadOverlayIndex(db, familyConfig, commit) {
  const overlayAppIdsByRootId = new Map()
  const stats = {
    scannedApps: 0,
    scannedOverlays: 0,
    updatedOverlays: 0,
  }

  const appsSnap = await db.collection('apps').get()
  stats.scannedApps = appsSnap.size

  for (const appDoc of appsSnap.docs) {
    const appId = appDoc.id
    const overlaysSnap = await appDoc.ref
      .collection(familyConfig.collectionPath)
      .get()

    for (const overlayDoc of overlaysSnap.docs) {
      stats.scannedOverlays += 1
      const overlayId = normalizeString(overlayDoc.id)
      if (!overlayId) continue

      const currentAppIds = overlayAppIdsByRootId.get(overlayId) || []
      currentAppIds.push(appId)
      overlayAppIdsByRootId.set(overlayId, currentAppIds)

      const overlayData = overlayDoc.data() || {}
      const overlayPatch = buildOverlayPatch(overlayData)
      if (!hasPatch(overlayPatch)) continue

      stats.updatedOverlays += 1
      if (commit) {
        await overlayDoc.ref.set(overlayPatch, { merge: true })
        console.log('[commit:overlay]', overlayDoc.ref.path, describePatch(overlayPatch))
      } else {
        console.log('[dry-run:overlay]', overlayDoc.ref.path, describePatch(overlayPatch))
      }
    }
  }

  return {
    overlayAppIdsByRootId,
    stats,
  }
}

async function migrateFamily(db, familyKey, familyConfig, commit) {
  const {
    overlayAppIdsByRootId,
    stats: overlayStats,
  } = await loadOverlayIndex(db, familyConfig, commit)

  const rootSnap = await db.collection(familyConfig.collectionPath).get()
  const stats = {
    family: familyKey,
    scannedRoots: rootSnap.size,
    updatedRoots: 0,
    rootOnly: 0,
    parentApp: 0,
    dedicatedApp: 0,
    ...overlayStats,
  }

  for (const rootDoc of rootSnap.docs) {
    const rootId = normalizeString(rootDoc.id)
    if (!rootId) continue

    const rootData = rootDoc.data() || {}
    const overlayAppIds = uniqueSorted(overlayAppIdsByRootId.get(rootId) || [])
    const appScope = resolveAppScope(familyKey, rootId, rootData, overlayAppIds)

    if (appScope.app_scope_state === 'root_only') stats.rootOnly += 1
    if (appScope.app_scope_state === 'parent_app') stats.parentApp += 1
    if (appScope.app_scope_state === 'dedicated_app') stats.dedicatedApp += 1

    const rootPatch = buildRootPatch(familyKey, rootId, rootData, overlayAppIds)
    if (!hasPatch(rootPatch)) continue

    stats.updatedRoots += 1
    if (commit) {
      await rootDoc.ref.set(rootPatch, { merge: true })
      console.log('[commit:root]', rootDoc.ref.path, describePatch(rootPatch))
    } else {
      console.log('[dry-run:root]', rootDoc.ref.path, describePatch(rootPatch))
    }
  }

  return stats
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const help = Boolean(args.help || args.h)
  const commit = Boolean(args.commit)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? args['service-account']
      : DEFAULT_SERVICE_ACCOUNT
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DEFAULT_DATABASE_ID
  const familyFilter = typeof args.family === 'string'
    ? uniqueSorted(args.family.split(','))
    : Object.keys(FAMILIES)

  if (help) {
    console.log('\nApp-scope-state migration\n')
    console.log('Optional:')
    console.log('  --service-account <path>')
    console.log('  --database <databaseId>')
    console.log('  --family projects,kitchens,suppliers,portfolios')
    console.log('  --commit')
    process.exit(0)
  }

  const invalidFamilies = familyFilter.filter((family) => !FAMILIES[family])
  if (invalidFamilies.length) {
    console.error(`Invalid --family value: ${invalidFamilies.join(', ')}`)
    process.exit(1)
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    `app-scope-state-${serviceAccount.projectId}-${databaseId || 'default'}-${Date.now()}`
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

  console.log('[migrate] app-scope-state start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: databaseId || '(default)',
    commit,
    families: familyFilter,
  })

  const results = []
  for (const familyKey of familyFilter) {
    const stats = await migrateFamily(db, familyKey, FAMILIES[familyKey], commit)
    results.push(stats)
    console.log('[migrate:family]', stats)
  }

  console.log('[migrate] app-scope-state done', {
    commit,
    results,
  })
}

main().catch((error) => {
  console.error('\nApp-scope-state migration failed:\n')
  console.error(error)
  process.exit(1)
})
