#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(undefined, DATABASE_ID)

const targets = [
  {
    label: 'Bären public doorway',
    path: 'menus/baeren-ringgenberg-delivery',
  },
  {
    label: 'Bären app-scoped menu',
    path: 'apps/misebox-app/kitchens/ChIJE-GP3-Kjj0cRzAv0WviwcsY/menus/delivery',
  },
  {
    label: 'La Tap public doorway',
    path: 'menus/la-tapberne-main',
  },
  {
    label: 'La Tap app-scoped menu',
    path: 'apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/main',
  },
]

const clean = (value) => {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(clean)
  if (typeof value !== 'object') return value
  if (typeof value.toDate === 'function') {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds }
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, clean(entry)])
  )
}

const rows = []

for (const target of targets) {
  const snap = await db.doc(target.path).get()
  const data = snap.exists ? snap.data() || {} : {}

  rows.push({
    label: target.label,
    path: target.path,
    exists: snap.exists,
    id: data.id || snap.id,
    name: data.name || '',
    status: data.status || '',
    ordering: clean(data.ordering || null),
    public_views: clean(data.public_views || null),
    source_kind: data.source_kind || data.kind || '',
    kitchen_id: data.kitchen_id || '',
  })
}

console.log(JSON.stringify(rows, null, 2))
