#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const uid = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const accountPath =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const account = JSON.parse(await readFile(accountPath, 'utf8'))
const app = initializeApp({
  credential: cert(account),
  projectId: account.project_id,
})
const db = getFirestore(app, 'misebox')
db.settings({ preferRest: true })

console.log('Reading root kitchens...')
const kitchensSnap = await db.collection('kitchens').get()
const kitchenIds = kitchensSnap.docs
  .map((doc) => String(doc.id || '').trim())
  .filter(Boolean)
  .sort()

console.log(`Writing ${kitchenIds.length} kitchen id(s) to users/${uid}.myKitchens...`)
const userRef = db.collection('users').doc(uid)
await userRef.set(
  {
    myKitchens: kitchenIds,
    updated: {
      by: 'system:migrate-current-user-my-kitchens',
      at: FieldValue.serverTimestamp(),
    },
  },
  { merge: true }
)

console.log(
  JSON.stringify(
    {
      ok: true,
      uid,
      database: 'misebox',
      kitchenCount: kitchenIds.length,
      kitchenIds,
    },
    null,
    2
  )
)

process.exit(0)
