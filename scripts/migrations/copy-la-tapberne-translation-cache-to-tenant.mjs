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
const MENU_ID = 'main'
const SOURCE_APP_ID = 'misebox-app'
const TARGET_APP_ID = 'la-tap-berne'
const SYSTEM_ACTOR = 'system:copy-la-tapberne-translation-cache-to-tenant'

const clean = (value) => String(value ?? '').trim()

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)

if (args.help || args.h) {
  console.log(`
Copy La Tap Berne menu translation cache into the tenant app scope.

Dry-run by default. Pass --commit to write.

Source:
  apps/${SOURCE_APP_ID}/kitchens/${KITCHEN_ID}/menus/${MENU_ID}/translation_cache

Target:
  apps/${TARGET_APP_ID}/kitchens/${KITCHEN_ID}/menus/${MENU_ID}/translation_cache

Usage:
  node scripts/migrations/copy-la-tapberne-translation-cache-to-tenant.mjs [--commit]
`)
  process.exit(0)
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `copy-la-tapberne-translation-cache-to-tenant-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const sourceMenuRef = db
  .collection('apps')
  .doc(SOURCE_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)
  .collection('menus')
  .doc(MENU_ID)
const targetMenuRef = db
  .collection('apps')
  .doc(TARGET_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)
  .collection('menus')
  .doc(MENU_ID)
const sourceCacheRef = sourceMenuRef.collection('translation_cache')
const targetCacheRef = targetMenuRef.collection('translation_cache')

const sourceSnap = await sourceCacheRef.get()
const targetSnap = await targetCacheRef.get()
const targetIds = new Set(targetSnap.docs.map((doc) => doc.id))
const docsToCopy = sourceSnap.docs.filter((doc) => !targetIds.has(doc.id))

let batch = db.batch()
let batchOps = 0
let written = 0

async function flush() {
  if (!commit || batchOps === 0) return
  await batch.commit()
  batch = db.batch()
  batchOps = 0
}

for (const docSnap of docsToCopy) {
  if (commit) {
    batch.set(
      targetCacheRef.doc(docSnap.id),
      {
        ...docSnap.data(),
        copied: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
          from: docSnap.ref.path,
        },
      },
      { merge: false }
    )
    batchOps += 1
    written += 1
  }

  if (batchOps >= 400) await flush()
}

await flush()

const finalTargetCount = commit
  ? Number((await targetCacheRef.count().get()).data().count || 0)
  : targetSnap.size

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId,
      commit,
      kitchenId: KITCHEN_ID,
      menuId: MENU_ID,
      sourcePath: sourceCacheRef.path,
      targetPath: targetCacheRef.path,
      sourceCount: sourceSnap.size,
      targetBeforeCount: targetSnap.size,
      alreadyPresent: sourceSnap.size - docsToCopy.length,
      plannedCopy: docsToCopy.length,
      written,
      targetAfterCount: finalTargetCount,
      sampleCopiedIds: docsToCopy.slice(0, 8).map((doc) => doc.id),
    },
    null,
    2
  )
)
