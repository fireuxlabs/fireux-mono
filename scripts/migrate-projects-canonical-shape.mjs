#!/usr/bin/env node
/*
  Canon migration for Project root docs + app overlays.

  What it does:
  - normalizes root project stamps:
      created_at -> created.at
      updated_at -> updated.at
      deletes legacy created_at / updated_at
  - normalizes legacy project_type values:
      standalone-app -> standalone_app
      ecosystem-app -> ecosystem_app
  - ensures app overlay exists at:
      apps/<appId>/projects/<projectId>
  - backfills missing overlay fields:
      admin_ids, join_requests, console_enabled, created.at, updated.at

  Usage:
    node scripts/migrate-projects-canonical-shape.mjs \
      --service-account packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json \
      --database fireux \
      --app fireux-app

    node scripts/migrate-projects-canonical-shape.mjs \
      --service-account packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json \
      --database fireux \
      --app fireux-app \
      --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BATCH_LIMIT = 400

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function normalizeProjectType(value) {
  const raw = normalizeString(value)
  if (!raw) return ''
  if (raw === 'standalone-app') return 'standalone_app'
  if (raw === 'ecosystem-app') return 'ecosystem_app'
  return raw
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getNestedTimestamp(data, path) {
  if (!isObject(data)) return null
  const [parent, child] = path.split('.')
  const parentValue = data[parent]
  if (!isObject(parentValue)) return null
  const value = parentValue[child]
  return value ?? null
}

function resolveTimestamp(...values) {
  for (const value of values) {
    if (value instanceof Timestamp) return value
    if (value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
      return new Timestamp(value._seconds, value._nanoseconds)
    }
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Timestamp(value.seconds, value.nanoseconds)
    }
  }
  return null
}

function uniqueStrings(values) {
  return [...new Set(
    values
      .map((value) => normalizeString(value))
      .filter(Boolean)
  )]
}

function buildRootPatch(data) {
  const patch = {}

  const createdAt = resolveTimestamp(
    getNestedTimestamp(data, 'created.at'),
    data.created_at,
    data.updated_at
  )
  const updatedAt = resolveTimestamp(
    getNestedTimestamp(data, 'updated.at'),
    data.updated_at,
    data.created_at
  )

  if (!getNestedTimestamp(data, 'created.at') && createdAt) {
    patch['created.at'] = createdAt
  }

  if (!getNestedTimestamp(data, 'updated.at') && updatedAt) {
    patch['updated.at'] = updatedAt
  }

  if (Object.prototype.hasOwnProperty.call(data, 'created_at')) {
    patch.created_at = FieldValue.delete()
  }

  if (Object.prototype.hasOwnProperty.call(data, 'updated_at')) {
    patch.updated_at = FieldValue.delete()
  }

  const normalizedProjectType = normalizeProjectType(data.project_type)
  if (normalizedProjectType && normalizedProjectType !== data.project_type) {
    patch.project_type = normalizedProjectType
  }

  return Object.keys(patch).length ? patch : null
}

function buildOverlayPayload(projectId, rootData, existingOverlay, appId) {
  const ownerUserId = normalizeString(rootData.owner_user_id)
  const rootCreatedAt = resolveTimestamp(
    getNestedTimestamp(rootData, 'created.at'),
    rootData.created_at,
    rootData.updated_at
  )
  const rootUpdatedAt = resolveTimestamp(
    getNestedTimestamp(rootData, 'updated.at'),
    rootData.updated_at,
    rootData.created_at
  )

  const overlayCreatedAt = resolveTimestamp(
    getNestedTimestamp(existingOverlay, 'created.at'),
    existingOverlay?.created_at,
    rootCreatedAt,
    rootUpdatedAt,
    Timestamp.now()
  )
  const overlayUpdatedAt = resolveTimestamp(
    getNestedTimestamp(existingOverlay, 'updated.at'),
    existingOverlay?.updated_at,
    rootUpdatedAt,
    rootCreatedAt,
    Timestamp.now()
  )

  const adminIds = uniqueStrings([
    ...(Array.isArray(existingOverlay?.admin_ids) ? existingOverlay.admin_ids : []),
    ownerUserId,
  ])

  return {
    admin_ids: adminIds,
    join_requests: Array.isArray(existingOverlay?.join_requests) ? existingOverlay.join_requests : [],
    console_enabled: typeof existingOverlay?.console_enabled === 'boolean' ? existingOverlay.console_enabled : true,
    created: {
      at: overlayCreatedAt,
      by: normalizeString(existingOverlay?.created?.by) || ownerUserId || undefined,
      app_id: normalizeString(existingOverlay?.created?.app_id) || appId || undefined,
    },
    updated: {
      at: overlayUpdatedAt,
      by: normalizeString(existingOverlay?.updated?.by) || ownerUserId || undefined,
    },
  }
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolved}`)
  }
  return {
    resolvedPath: resolved,
    projectId: String(parsed.project_id),
    credential: cert(parsed),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const help = Boolean(args.help || args.h)
  const commit = Boolean(args.commit)
  const serviceAccountPath = typeof args['service-account'] === 'string'
    ? args['service-account']
    : 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
  const databaseId = typeof args.database === 'string' ? normalizeString(args.database) : ''
  const appId = typeof args.app === 'string' ? normalizeString(args.app) : ''
  const projectIdFilter = typeof args.projectId === 'string' ? normalizeString(args.projectId) : ''

  if (help) {
    console.log('\nProject canonical-shape migration\n')
    console.log('Required:')
    console.log('  --service-account <path>')
    console.log('  --app <appId>')
    console.log('Optional:')
    console.log('  --database <databaseId>')
    console.log('  --projectId <projectId>')
    console.log('  --commit')
    process.exit(0)
  }

  if (!appId) {
    console.error('Missing --app <appId>.')
    process.exit(1)
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const appName = `project-canon-migrate-${serviceAccount.projectId}-${Date.now()}`
  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    appName
  )

  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const rootCollection = db.collection('projects')
  const rootSnap = projectIdFilter
    ? await rootCollection.where('__name__', '==', projectIdFilter).get()
    : await rootCollection.get()

  console.log('[migrate] projects-canonical-shape start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: databaseId || '(default)',
    appId,
    projectIdFilter: projectIdFilter || null,
    commit,
    count: rootSnap.size,
  })

  const stats = {
    scanned: 0,
    updatedRoots: 0,
    createdOverlays: 0,
    updatedOverlays: 0,
    skipped: 0,
  }

  let batch = db.batch()
  let ops = 0

  const queue = async (ref, patch, mode = 'update') => {
    if (!commit) {
      console.log('[dry-run]', mode, ref.path, patch)
      return
    }

    if (mode === 'set') {
      batch.set(ref, patch)
    } else {
      batch.update(ref, patch)
    }
    ops += 1

    if (ops >= BATCH_LIMIT) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  for (const rootDoc of rootSnap.docs) {
    stats.scanned += 1
    const rootData = rootDoc.data() || {}
    const rootPatch = buildRootPatch(rootData)

    if (rootPatch) {
      stats.updatedRoots += 1
      await queue(rootDoc.ref, rootPatch, 'update')
    }

    const overlayRef = db.collection('apps').doc(appId).collection('projects').doc(rootDoc.id)
    const overlaySnap = await overlayRef.get()
    const overlayData = overlaySnap.exists ? (overlaySnap.data() || {}) : null
    const overlayPayload = buildOverlayPayload(rootDoc.id, rootData, overlayData, appId)

    if (!overlaySnap.exists) {
      stats.createdOverlays += 1
      await queue(overlayRef, overlayPayload, 'set')
      continue
    }

    const overlayNeedsUpdate =
      JSON.stringify(overlayPayload.admin_ids) !== JSON.stringify(overlayData?.admin_ids ?? []) ||
      JSON.stringify(overlayPayload.join_requests) !== JSON.stringify(overlayData?.join_requests ?? []) ||
      overlayPayload.console_enabled !== overlayData?.console_enabled ||
      !getNestedTimestamp(overlayData, 'created.at') ||
      !getNestedTimestamp(overlayData, 'updated.at') ||
      Object.prototype.hasOwnProperty.call(overlayData, 'created_at') ||
      Object.prototype.hasOwnProperty.call(overlayData, 'updated_at')

    if (overlayNeedsUpdate) {
      stats.updatedOverlays += 1
      const overlayPatch = {
        admin_ids: overlayPayload.admin_ids,
        join_requests: overlayPayload.join_requests,
        console_enabled: overlayPayload.console_enabled,
        created: overlayPayload.created,
        updated: overlayPayload.updated,
      }

      if (Object.prototype.hasOwnProperty.call(overlayData, 'created_at')) {
        overlayPatch.created_at = FieldValue.delete()
      }
      if (Object.prototype.hasOwnProperty.call(overlayData, 'updated_at')) {
        overlayPatch.updated_at = FieldValue.delete()
      }

      await queue(overlayRef, overlayPatch, 'update')
      continue
    }

    if (!rootPatch) {
      stats.skipped += 1
    }
  }

  if (commit && ops > 0) {
    await batch.commit()
  }

  console.log('[migrate] projects-canonical-shape done', {
    ...stats,
    commit,
  })

  await app.delete()
}

await main().catch((error) => {
  console.error('\nMigration failed:')
  console.error(error)
  process.exit(1)
})
