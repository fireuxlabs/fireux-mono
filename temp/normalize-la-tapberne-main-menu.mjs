#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const APP_ID = 'la-tap-berne'
const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const ACTOR = 'system:normalize-la-tapberne-main-menu'

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(app, DATABASE_ID)
const menuCollection = db.collection(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/menus`)
const mainRef = menuCollection.doc('main')
const defaultRef = menuCollection.doc('default')
const [mainSnap, defaultSnap] = await Promise.all([
  mainRef.get(),
  defaultRef.get(),
])

if (!mainSnap.exists) {
  throw new Error(`Missing ${mainRef.path}`)
}

await db.runTransaction(async (transaction) => {
  transaction.set(
    mainRef,
    {
      status: 'published',
      updated: {
        at: Timestamp.now(),
        by: ACTOR,
      },
    },
    { merge: true }
  )

  if (defaultSnap.exists) {
    transaction.set(
      defaultRef,
      {
        status: 'archived',
        updated: {
          at: Timestamp.now(),
          by: ACTOR,
        },
      },
      { merge: true }
    )
  }
})

console.log(JSON.stringify({
  appId: APP_ID,
  kitchenId: KITCHEN_ID,
  published: mainRef.path,
  archived: defaultSnap.exists ? defaultRef.path : null,
}, null, 2))
