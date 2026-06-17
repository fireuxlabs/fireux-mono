#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const ACTOR = 'system:publish-root-menu-doorways'

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(app, DATABASE_ID)
const snap = await db.collection('menus').get()
const updated = []

for (const doc of snap.docs) {
  const status = String(doc.data().status ?? '').trim()
  if (status) continue

  await doc.ref.set(
    {
      status: 'published',
      updated: {
        at: Timestamp.now(),
        by: ACTOR,
      },
    },
    { merge: true }
  )

  updated.push(doc.ref.path)
}

console.log(JSON.stringify({
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  updated,
}, null, 2))
