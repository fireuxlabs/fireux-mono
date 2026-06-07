#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const KITCHEN_SLUG = 'la-tapberne'
const SOURCE_APP_ID = 'misebox-app'
const TARGET_APP_ID = 'la-tap-berne'
const SYSTEM_ACTOR = 'system:migrate-la-tapberne-dedicated-app'

const clean = (value) => String(value ?? '').trim()
const splitList = (value) =>
  clean(value)
    .split(',')
    .map((item) => clean(item))
    .filter(Boolean)

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const includeTranslationCache = Boolean(args['include-translation-cache'])
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)
const collectionFilter = new Set(splitList(args.collections))
const skippedCollectionIds = new Set(splitList(args['skip-collections']))

if (!includeTranslationCache) skippedCollectionIds.add('translation_cache')

if (args.help || args.h) {
  console.log(`
Promote La Tap Berne into its dedicated app scope.

Dry-run by default. Pass --commit to write.

This migration:
  - copies existing app/root Kitchen descendants into apps/${TARGET_APP_ID}/kitchens/${KITCHEN_ID}
  - marks the root Kitchen as dedicated to ${TARGET_APP_ID}
  - leaves the old ${SOURCE_APP_ID} app-scoped copy in place for rollback/inspection

Usage:
  node scripts/migrations/migrate-la-tapberne-dedicated-app.mjs [--commit]

Options:
  --commit                 Write changes.
  --collections <a,b>      Optional top-level Kitchen child collections to copy.
  --include-translation-cache
                           Also copy menu translation_cache records.
  --skip-collections <a,b> Optional collection ids to skip at any depth.
  --project <id>           Firebase project id. Defaults to ${DEFAULT_PROJECT_ID}.
  --database <id>          Firestore database id. Defaults to ${DEFAULT_DATABASE_ID}.
  --service-account <path> Service account JSON path.
`)
  process.exit(0)
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `migrate-la-tapberne-dedicated-app-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const rootRef = db.collection('kitchens').doc(KITCHEN_ID)
const sourceAppRef = db
  .collection('apps')
  .doc(SOURCE_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)
const targetAppRef = db
  .collection('apps')
  .doc(TARGET_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)

const summary = {
  projectId,
  databaseId,
  kitchenId: KITCHEN_ID,
  kitchenSlug: KITCHEN_SLUG,
  sourceAppId: SOURCE_APP_ID,
  targetAppId: TARGET_APP_ID,
  commit,
  collections: collectionFilter.size ? [...collectionFilter].sort() : '(all)',
  skippedCollectionIds: [...skippedCollectionIds].sort(),
  includeTranslationCache,
  rootExists: false,
  sourceAppExists: false,
  targetAppExists: false,
  rootScopeUpdated: false,
  targetOverlayWritten: false,
  docsPlanned: 0,
  docsWritten: 0,
  subcollectionsSkipped: 0,
  sourcePasses: [],
  paths: [],
  skippedPaths: [],
}

let batch = db.batch()
let batchOps = 0
const PATH_SAMPLE_LIMIT = 160
const SKIPPED_PATH_SAMPLE_LIMIT = 80

function stamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
  }
}

function rememberPath(entry) {
  if (summary.paths.length < PATH_SAMPLE_LIMIT) summary.paths.push(entry)
}

function rememberSkipped(entry) {
  summary.subcollectionsSkipped += 1
  if (summary.skippedPaths.length < SKIPPED_PATH_SAMPLE_LIMIT) {
    summary.skippedPaths.push(entry)
  }
}

function shouldCopyTopLevelCollection(collectionId) {
  return collectionFilter.size === 0 || collectionFilter.has(collectionId)
}

function shouldSkipCollection(collectionRef, reason) {
  if (!skippedCollectionIds.has(collectionRef.id)) return false

  rememberSkipped({
    path: collectionRef.path,
    collectionId: collectionRef.id,
    reason,
  })
  return true
}

async function queueWrite(sourceRef, targetRef, data, label) {
  summary.docsPlanned += 1
  rememberPath({
    from: sourceRef.path,
    to: targetRef.path,
    label,
    action: commit ? 'write' : 'would-write',
  })

  if (!commit) return

  batch.set(targetRef, data, { merge: false })
  batchOps += 1
  summary.docsWritten += 1

  if (batchOps < 400) {
    return
  }

  await batch.commit()
  batch = db.batch()
  batchOps = 0
}

async function copyDocumentTree(sourceRef, targetRef, label) {
  const sourceSnap = await sourceRef.get()
  if (!sourceSnap.exists) return

  await queueWrite(sourceRef, targetRef, sourceSnap.data() || {}, label)

  const subcollections = await sourceRef.listCollections()
  for (const sourceCollection of subcollections) {
    if (shouldSkipCollection(sourceCollection, 'skip-collections')) continue

    const sourceDocs = await sourceCollection.get()

    for (const sourceDoc of sourceDocs.docs) {
      await copyDocumentTree(
        sourceDoc.ref,
        targetRef.collection(sourceCollection.id).doc(sourceDoc.id),
        `${label}/${sourceCollection.id}`
      )
    }
  }
}

async function copyDescendants(sourceRootRef, label) {
  const sourceSnap = await sourceRootRef.get()
  if (!sourceSnap.exists) {
    summary.sourcePasses.push({ label, path: sourceRootRef.path, exists: false })
    return
  }

  const subcollections = await sourceRootRef.listCollections()
  summary.sourcePasses.push({
    label,
    path: sourceRootRef.path,
    exists: true,
    subcollections: subcollections.map((collection) => collection.id).sort(),
  })

  for (const sourceCollection of subcollections) {
    if (!shouldCopyTopLevelCollection(sourceCollection.id)) {
      rememberSkipped({
        path: sourceCollection.path,
        collectionId: sourceCollection.id,
        reason: 'top-level-collection-filter',
      })
      continue
    }

    if (shouldSkipCollection(sourceCollection, 'skip-collections')) continue

    const sourceDocs = await sourceCollection.get()
    for (const sourceDoc of sourceDocs.docs) {
      await copyDocumentTree(
        sourceDoc.ref,
        targetAppRef.collection(sourceCollection.id).doc(sourceDoc.id),
        `${label}/${sourceCollection.id}`
      )
    }
  }
}

async function main() {
  const rootSnap = await rootRef.get()
  const sourceAppSnap = await sourceAppRef.get()
  const targetAppSnap = await targetAppRef.get()

  summary.rootExists = rootSnap.exists
  summary.sourceAppExists = sourceAppSnap.exists
  summary.targetAppExists = targetAppSnap.exists

  if (!rootSnap.exists) {
    throw new Error(`Root Kitchen missing: ${rootRef.path}`)
  }

  const rootData = rootSnap.data() || {}
  const sourceAppData = sourceAppSnap.exists ? sourceAppSnap.data() || {} : {}
  const targetOverlay = {
    ...rootData,
    ...sourceAppData,
    id: KITCHEN_ID,
    slug: clean(sourceAppData.slug) || clean(rootData.slug) || KITCHEN_SLUG,
    app_id: TARGET_APP_ID,
    app_scope_state: 'dedicated_app',
    app_scope_app_id: TARGET_APP_ID,
    updated: stamp(),
  }

  await queueWrite(rootRef, targetAppRef, targetOverlay, 'target-overlay')
  summary.targetOverlayWritten = true

  const rootScopePatch = {
    app_id: TARGET_APP_ID,
    app_scope_state: 'dedicated_app',
    app_scope_app_id: TARGET_APP_ID,
    updated: stamp(),
  }
  rememberPath({
    from: rootRef.path,
    to: rootRef.path,
    label: 'root-scope',
    action: 'merge',
    patch: rootScopePatch,
  })
  summary.rootScopeUpdated = true
  if (commit) {
    batch.set(rootRef, rootScopePatch, { merge: true })
    batchOps += 1
    summary.docsWritten += 1
  }

  await copyDescendants(rootRef, 'root')
  await copyDescendants(sourceAppRef, 'source-app')

  if (commit && batchOps) await batch.commit()

  console.log(
    JSON.stringify(
      {
        ...summary,
        pathsTruncated: summary.docsPlanned + 1 > PATH_SAMPLE_LIMIT,
        skippedPathsTruncated: summary.subcollectionsSkipped > SKIPPED_PATH_SAMPLE_LIMIT,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error('[migrate] la-tapberne-dedicated-app failed')
  console.error(error)
  process.exitCode = 1
})
