#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const OLD_APP_ID = 'misebox-app'
const TARGET_APP_ID = 'la-tap-berne'

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
Clean old La Tap Berne operational copies after tenant migration.

Dry-run by default. Pass --commit to delete stale copies.

Keeps:
  places/${KITCHEN_ID}
  kitchens/${KITCHEN_ID}
  apps/${TARGET_APP_ID}/kitchens/${KITCHEN_ID}/**

Deletes:
  apps/${OLD_APP_ID}/kitchens/${KITCHEN_ID}/**
  kitchens/${KITCHEN_ID}/dishes/**
  kitchens/${KITCHEN_ID}/menus/**

Usage:
  node scripts/migrations/cleanup-la-tapberne-old-app-scope.mjs [--commit]
`)
  process.exit(0)
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `cleanup-la-tapberne-old-app-scope-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const rootKitchenRef = db.collection('kitchens').doc(KITCHEN_ID)
const oldAppKitchenRef = db
  .collection('apps')
  .doc(OLD_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)
const targetKitchenRef = db
  .collection('apps')
  .doc(TARGET_APP_ID)
  .collection('kitchens')
  .doc(KITCHEN_ID)

async function countCollection(collectionRef) {
  return Number((await collectionRef.count().get()).data().count || 0)
}

async function documentExists(docRef) {
  const snap = await docRef.get()
  return snap.exists
}

async function countImmediateChildren(docRef) {
  const snap = await docRef.get()
  if (!snap.exists) return {}

  const counts = {}
  const subcollections = await docRef.listCollections()
  for (const subcollection of subcollections.sort((a, b) => a.id.localeCompare(b.id))) {
    counts[subcollection.id] = await countCollection(subcollection)
  }

  return counts
}

async function deleteCollection(collectionRef) {
  if (!commit) return
  await db.recursiveDelete(collectionRef)
}

async function deleteDocumentTree(docRef) {
  if (!commit) return
  await db.recursiveDelete(docRef)
}

const rootSnap = await rootKitchenRef.get()
const targetSnap = await targetKitchenRef.get()
const oldSnap = await oldAppKitchenRef.get()

if (!rootSnap.exists) throw new Error(`Missing root kitchen: ${rootKitchenRef.path}`)
if (!targetSnap.exists) throw new Error(`Missing tenant kitchen: ${targetKitchenRef.path}`)

const rootData = rootSnap.data() || {}
if (clean(rootData.app_scope_app_id) !== TARGET_APP_ID) {
  throw new Error(
    `Root kitchen is not pointed at ${TARGET_APP_ID}: ${rootKitchenRef.path}`
  )
}

const planned = {
  oldAppKitchen: {
    path: oldAppKitchenRef.path,
    exists: oldSnap.exists,
    childDocs: await countImmediateChildren(oldAppKitchenRef),
  },
  rootChildren: {
    dishes: {
      path: rootKitchenRef.collection('dishes').path,
      docs: await countCollection(rootKitchenRef.collection('dishes')),
    },
    menus: {
      path: rootKitchenRef.collection('menus').path,
      docs: await countCollection(rootKitchenRef.collection('menus')),
    },
  },
  kept: {
    rootKitchen: rootKitchenRef.path,
    tenantKitchen: targetKitchenRef.path,
    tenantChildDocs: await countImmediateChildren(targetKitchenRef),
  },
}

await deleteDocumentTree(oldAppKitchenRef)
await deleteCollection(rootKitchenRef.collection('dishes'))
await deleteCollection(rootKitchenRef.collection('menus'))

const after = {
  oldAppKitchenExists: await documentExists(oldAppKitchenRef),
  rootDishes: await countCollection(rootKitchenRef.collection('dishes')),
  rootMenus: await countCollection(rootKitchenRef.collection('menus')),
  tenantKitchenExists: await documentExists(targetKitchenRef),
  tenantChildDocs: await countImmediateChildren(targetKitchenRef),
}

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId,
      commit,
      kitchenId: KITCHEN_ID,
      planned,
      after,
    },
    null,
    2
  )
)
