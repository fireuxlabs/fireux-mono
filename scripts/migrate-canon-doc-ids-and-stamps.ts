#!/usr/bin/env node
/*
  Canon migration for FireUX apps/users/profiles:
  - removes stored duplicate top-level `id`
  - converts legacy flat stamps to nested stamps when missing:
      created_at   -> created.at
      updated_at   -> updated.at
      creator_id   -> created.by
      app_id       -> created.app_id
  - deletes legacy flat stamp fields after conversion

  Scope:
  - root apps docs (`apps/<appId>`)
  - root users docs (`users/<uid>`)
  - app user overlays (`apps/<appId>/users/<uid>`)
  - root profile docs (`chefs|agents|professionals|suppliers/<uid>`)
  - app profile overlays (`apps/<appId>/{chefs|agents|professionals|suppliers}/<uid>`)

  Usage:
    node --experimental-strip-types scripts/migrate-canon-doc-ids-and-stamps.ts
    node --experimental-strip-types scripts/migrate-canon-doc-ids-and-stamps.ts \
      --service-account packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json \
      --service-account packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

type Args = {
  serviceAccounts: string[]
}

type CollectionStats = {
  scanned: number
  updated: number
}

type ProjectStats = {
  projectId: string
  collections: Record<string, CollectionStats>
  scanned: number
  updated: number
}

type MigrationSummary = {
  projects: ProjectStats[]
  totals: {
    scanned: number
    updated: number
  }
}

const PROFILE_COLLECTIONS = ['chefs', 'agents', 'professionals', 'suppliers'] as const
const APP_SUBCOLLECTIONS = ['users', ...PROFILE_COLLECTIONS] as const
const BATCH_LIMIT = 400

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SERVICE_ACCOUNTS = [
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json',
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json',
  'packages/ecosystem/fireux-cleanbox/src/config/firebase/service-account.json',
]

function parseArgs(argv: string[]): Args {
  const out: Args = { serviceAccounts: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg !== '--service-account') continue
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      throw new Error('Missing value for --service-account')
    }
    out.serviceAccounts.push(next)
    i += 1
  }
  return out
}

function hasOwn(obj: unknown, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getCollectionStats(
  projectStats: ProjectStats,
  collectionName: string
): CollectionStats {
  const existing = projectStats.collections[collectionName]
  if (existing) return existing
  const next: CollectionStats = { scanned: 0, updated: 0 }
  projectStats.collections[collectionName] = next
  return next
}

function buildPatch(data: Record<string, unknown>) {
  const patch: Record<string, unknown> = {}

  const created = isObject(data.created) ? data.created : undefined
  const updated = isObject(data.updated) ? data.updated : undefined
  const hasCreatedAt = created && hasOwn(created, 'at') && created.at != null
  const hasUpdatedAt = updated && hasOwn(updated, 'at') && updated.at != null
  const hasCreatedBy = created && hasOwn(created, 'by') && typeof created.by === 'string' && created.by.trim()
  const hasCreatedAppId =
    created && hasOwn(created, 'app_id') && typeof created.app_id === 'string' && created.app_id.trim()

  if (hasOwn(data, 'id')) {
    patch.id = FieldValue.delete()
  }

  if (hasOwn(data, 'created_at')) {
    const legacyCreatedAt = data.created_at
    if (!hasCreatedAt && legacyCreatedAt != null) {
      patch['created.at'] = legacyCreatedAt
    }
    patch.created_at = FieldValue.delete()
  }

  if (hasOwn(data, 'updated_at')) {
    const legacyUpdatedAt = data.updated_at
    if (!hasUpdatedAt && legacyUpdatedAt != null) {
      patch['updated.at'] = legacyUpdatedAt
    }
    patch.updated_at = FieldValue.delete()
  }

  if (hasOwn(data, 'creator_id')) {
    const creatorId = typeof data.creator_id === 'string' ? data.creator_id.trim() : ''
    if (!hasCreatedBy && creatorId) {
      patch['created.by'] = creatorId
    }
    patch.creator_id = FieldValue.delete()
  }

  if (hasOwn(data, 'app_id')) {
    const appId = typeof data.app_id === 'string' ? data.app_id.trim() : ''
    if (!hasCreatedAppId && appId) {
      patch['created.app_id'] = appId
    }
    patch.app_id = FieldValue.delete()
  }

  return Object.keys(patch).length ? patch : null
}

async function migrateDocs(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  projectStats: ProjectStats,
  collectionName: string
) {
  const db = docs[0]?.ref.firestore
  if (!db) {
    const stats = getCollectionStats(projectStats, collectionName)
    console.log(`[${projectStats.projectId}] ${collectionName}: scanned=${stats.scanned} updated=${stats.updated}`)
    return
  }

  const stats = getCollectionStats(projectStats, collectionName)
  let batch = db.batch()
  let ops = 0

  for (const docSnap of docs) {
    stats.scanned += 1
    projectStats.scanned += 1

    const patch = buildPatch((docSnap.data() || {}) as Record<string, unknown>)
    if (!patch) continue

    batch.update(docSnap.ref, patch)
    ops += 1
    stats.updated += 1
    projectStats.updated += 1

    if (ops >= BATCH_LIMIT) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) {
    await batch.commit()
  }

  console.log(`[${projectStats.projectId}] ${collectionName}: scanned=${stats.scanned} updated=${stats.updated}`)
}

async function migrateCollection(
  db: FirebaseFirestore.Firestore,
  projectStats: ProjectStats,
  collectionPath: string,
  collectionName: string
) {
  const snap = await db.collection(collectionPath).get()
  await migrateDocs(snap.docs, projectStats, collectionName)
  return snap.docs
}

async function loadServiceAccount(pathLike: string) {
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

async function migrateProject(serviceAccountPath: string): Promise<ProjectStats> {
  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const appName = `canon-migrate-${serviceAccount.projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    appName
  )

  const db = getFirestore(app)
  const projectStats: ProjectStats = {
    projectId: serviceAccount.projectId,
    collections: {},
    scanned: 0,
    updated: 0,
  }

  console.log(`\n=== ${serviceAccount.projectId} ===`)
  console.log(`serviceAccount: ${serviceAccount.resolvedPath}`)

  const appDocs = await migrateCollection(db, projectStats, 'apps', 'apps')
  await migrateCollection(db, projectStats, 'users', 'users')

  for (const collectionName of PROFILE_COLLECTIONS) {
    await migrateCollection(db, projectStats, collectionName, collectionName)
  }

  for (const appDoc of appDocs) {
    for (const subcollectionName of APP_SUBCOLLECTIONS) {
      await migrateCollection(
        db,
        projectStats,
        `apps/${appDoc.id}/${subcollectionName}`,
        `apps/*/${subcollectionName}`
      )
    }
  }

  console.log(
    `[${projectStats.projectId}] totals: scanned=${projectStats.scanned} updated=${projectStats.updated}`
  )

  await app.delete()
  return projectStats
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const serviceAccounts =
    args.serviceAccounts.length > 0 ? args.serviceAccounts : DEFAULT_SERVICE_ACCOUNTS

  if (getApps().length) {
    console.warn(
      '[warn] firebase-admin apps already initialized in this process; script will use named apps only'
    )
  }

  const summary: MigrationSummary = {
    projects: [],
    totals: {
      scanned: 0,
      updated: 0,
    },
  }

  for (const serviceAccountPath of serviceAccounts) {
    const projectStats = await migrateProject(serviceAccountPath)
    summary.projects.push(projectStats)
    summary.totals.scanned += projectStats.scanned
    summary.totals.updated += projectStats.updated
  }

  console.log('\n=== Migration Summary ===')
  console.log(JSON.stringify(summary, null, 2))
}

await main().catch((error) => {
  console.error('\nMigration failed:')
  console.error(error)
  process.exit(1)
})
