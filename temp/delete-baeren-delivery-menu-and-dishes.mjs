#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const COMMIT = process.argv.includes('--commit')
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'misebox-app'
const KITCHEN_ID = 'ChIJE-GP3-Kjj0cRzAv0WviwcsY'
const MENU_ID = 'delivery-ordering'
const ROOT_MENU_ID = 'baeren-ringgenberg-delivery-ordering'
const KITCHEN_BASES = [
  `apps/${APP_ID}/kitchens/${KITCHEN_ID}`,
  `kitchens/${KITCHEN_ID}`,
]

const serviceAccount = JSON.parse(await readFile(SERVICE_ACCOUNT, 'utf8'))
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: PROJECT_ID,
}, `delete-baeren-delivery-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)

async function collectDocumentTree(docRef, deletes) {
  const snap = await docRef.get()
  if (!snap.exists) return false

  const subcollections = await docRef.listCollections()
  for (const subcollection of subcollections) {
    const childSnaps = await subcollection.get()
    for (const childSnap of childSnaps.docs) {
      await collectDocumentTree(childSnap.ref, deletes)
    }
  }

  deletes.push(docRef)
  return true
}

async function collectCollection(collectionRef, deletes) {
  const snap = await collectionRef.get()
  for (const docSnap of snap.docs) {
    await collectDocumentTree(docSnap.ref, deletes)
  }
  return snap.size
}

async function commitDeletes(deletes) {
  let deleted = 0
  for (let index = 0; index < deletes.length; index += 450) {
    const batch = db.batch()
    deletes.slice(index, index + 450).forEach((ref) => batch.delete(ref))
    await batch.commit()
    deleted += Math.min(450, deletes.length - index)
  }
  return deleted
}

const deletes = []
const summary = []

for (const base of KITCHEN_BASES) {
  const menuRef = db.doc(`${base}/menus/${MENU_ID}`)
  const menuExists = await collectDocumentTree(menuRef, deletes)
  const dishesCount = await collectCollection(db.collection(`${base}/dishes`), deletes)

  summary.push({
    base,
    menuPath: menuRef.path,
    menuExists,
    dishesPath: `${base}/dishes`,
    dishesCount,
  })
}

const rootMenuRef = db.doc(`menus/${ROOT_MENU_ID}`)
const rootMenuExists = await collectDocumentTree(rootMenuRef, deletes)
summary.push({
  base: 'root-public',
  menuPath: rootMenuRef.path,
  menuExists: rootMenuExists,
})

const deleted = COMMIT ? await commitDeletes(deletes) : 0

console.log(JSON.stringify({
  commit: COMMIT,
  deleted,
  plannedDeletes: deletes.length,
  summary,
  keptForRetest: [
    `apps/${APP_ID}/kitchens/${KITCHEN_ID}/menu-uploads/delivery`,
  ],
}, null, 2))
