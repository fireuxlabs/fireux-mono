#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_ROOT_KITCHEN_COLLECTION = 'kitchens'
const DEFAULT_TARGET_APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:align-kitchen-app-scope'

const clean = (value) => String(value ?? '').trim()

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const overwrite = Boolean(args.overwrite)
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)
const rootKitchenCollection = clean(
  args['root-kitchen-collection'] || DEFAULT_ROOT_KITCHEN_COLLECTION
)
const targetAppId = clean(args['target-app'] || args.targetApp || DEFAULT_TARGET_APP_ID)
const kitchenIdFilter = clean(args['kitchen-id'] || args.kitchenId)
const collectionFilter = new Set(
  clean(args.collections)
    .split(',')
    .map((value) => clean(value))
    .filter(Boolean)
)
const maxDocsPerCollection = Math.max(0, Number(args['max-docs'] || args.maxDocs || 0))

if (args.help || args.h) {
  console.log(`
Align Kitchen app-scoped data.

Copies missing root Kitchen documents and their child subcollections into:
  apps/{targetAppId}/kitchens/{kitchenId}

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/align-kitchen-app-scope.mjs [--commit]

Options:
  --target-app <appId>              Target app id. Defaults to misebox-app.
  --kitchen-id <kitchenId>          Optional single kitchen id.
  --collections <a,b>              Optional child collections to copy.
  --max-docs <n>                   Optional per-collection cap for quick audits.
  --overwrite                       Overwrite existing target docs.
  --project <id>                    Firebase project id. Defaults to misebox-78f9c.
  --database <id>                   Firestore database id. Defaults to misebox.
  --service-account <path>          Service account JSON path.
  --root-kitchen-collection <path>  Root Kitchen collection. Defaults to kitchens.
`)
  process.exit(0)
}

if (!projectId) throw new Error('Missing project id.')
if (!databaseId) throw new Error('Missing database id.')
if (!serviceAccountPath) throw new Error('Missing service account path.')
if (!rootKitchenCollection) throw new Error('Missing root Kitchen collection path.')
if (!targetAppId) throw new Error('Missing target app id.')

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `align-kitchen-app-scope-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const summary = {
  projectId,
  databaseId,
  rootKitchenCollection,
  targetAppId,
  kitchenId: kitchenIdFilter || '(all)',
  commit,
  overwrite,
  collections: collectionFilter.size ? [...collectionFilter] : '(all)',
  maxDocsPerCollection,
  kitchens: 0,
  overlayCreates: 0,
  overlayUpdates: 0,
  docsCopied: 0,
  docsSkipped: 0,
  subcollectionsCopied: 0,
  paths: [],
}

function overlayPayload(rootSnap) {
  const data = rootSnap.data() || {}
  return {
    ...data,
    id: clean(data.id) || rootSnap.id,
    app_scope_app_id: targetAppId,
    app_scope_state: clean(data.app_scope_state) || 'parent_app',
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

async function copyDocumentTree(sourceRef, targetRef, depth = 0) {
  const sourceSnap = await sourceRef.get()
  if (!sourceSnap.exists) return

  const targetSnap = await targetRef.get()
  const shouldWrite = overwrite || !targetSnap.exists

  if (shouldWrite) {
    summary.docsCopied += 1
    summary.paths.push({
      from: sourceRef.path,
      to: targetRef.path,
      action: targetSnap.exists ? 'overwrite' : 'create',
    })

    if (commit) {
      await targetRef.set(sourceSnap.data() || {}, { merge: false })
    }
  } else {
    summary.docsSkipped += 1
  }

  const subcollections = await sourceRef.listCollections()
  if (subcollections.length) summary.subcollectionsCopied += subcollections.length

  for (const sourceCollection of subcollections) {
    let query = sourceCollection
    if (maxDocsPerCollection > 0) query = query.limit(maxDocsPerCollection)
    const sourceDocs = await query.get()

    for (const sourceDoc of sourceDocs.docs) {
      await copyDocumentTree(
        sourceDoc.ref,
        targetRef.collection(sourceCollection.id).doc(sourceDoc.id),
        depth + 1
      )
    }
  }
}

async function alignKitchen(rootSnap) {
  summary.kitchens += 1

  const kitchenId = rootSnap.id
  const rootRef = rootSnap.ref
  const overlayRef = db.doc(`apps/${targetAppId}/kitchens/${kitchenId}`)
  const overlaySnap = await overlayRef.get()

  if (!overlaySnap.exists) {
    summary.overlayCreates += 1
    summary.paths.push({
      from: rootRef.path,
      to: overlayRef.path,
      action: 'create-overlay',
    })

    if (commit) {
      await overlayRef.set(overlayPayload(rootSnap), { merge: false })
    }
  } else if (overwrite) {
    summary.overlayUpdates += 1
    summary.paths.push({
      from: rootRef.path,
      to: overlayRef.path,
      action: 'overwrite-overlay',
    })

    if (commit) {
      await overlayRef.set(overlayPayload(rootSnap), { merge: false })
    }
  }

  const childCollections = await rootRef.listCollections()
  for (const childCollection of childCollections) {
    if (collectionFilter.size && !collectionFilter.has(childCollection.id)) {
      continue
    }

    let query = childCollection
    if (maxDocsPerCollection > 0) query = query.limit(maxDocsPerCollection)
    const childDocs = await query.get()
    for (const childDoc of childDocs.docs) {
      await copyDocumentTree(
        childDoc.ref,
        overlayRef.collection(childCollection.id).doc(childDoc.id)
      )
    }
  }
}

const rootKitchenRefs = kitchenIdFilter
  ? [db.collection(rootKitchenCollection).doc(kitchenIdFilter)]
  : (await db.collection(rootKitchenCollection).get()).docs.map((doc) => doc.ref)

for (const rootKitchenRef of rootKitchenRefs) {
  const rootSnap = await rootKitchenRef.get()
  if (!rootSnap.exists) {
    summary.paths.push({
      from: rootKitchenRef.path,
      to: '',
      action: 'missing-root-kitchen',
    })
    continue
  }

  await alignKitchen(rootSnap)
}

console.log(
  JSON.stringify(
    {
      ...summary,
      paths: summary.paths.slice(0, 200),
      pathsTruncated: summary.paths.length > 200,
    },
    null,
    2
  )
)
