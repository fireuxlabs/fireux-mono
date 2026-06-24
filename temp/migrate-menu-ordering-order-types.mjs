#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

const commit = process.argv.includes('--commit')
const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(undefined, DATABASE_ID)

const supportedTypes = new Set([
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])

const clean = (value) => String(value ?? '').trim()
const noticeHours = (value) => {
  const hours = Number(value)

  return Number.isFinite(hours) && hours > 0 ? hours : undefined
}
const orderTypeConfig = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const type = clean(value.type)
  const notice = noticeHours(value.notice_hours)
  const message = clean(value.message)

  if (!supportedTypes.has(type)) return null

  return {
    type,
    ...(notice ? { notice_hours: notice } : {}),
    ...(message ? { message } : {}),
  }
}
const normalizeOrdering = (ordering) => {
  if (!ordering || typeof ordering !== 'object' || Array.isArray(ordering)) {
    return null
  }

  const existingOrderTypes = Array.isArray(ordering.order_types)
    ? ordering.order_types
    : []
  const oldModes = Array.isArray(ordering.modes) ? ordering.modes : []
  const sourceRows = existingOrderTypes.length ? existingOrderTypes : oldModes
  const orderTypes = sourceRows
    .map(orderTypeConfig)
    .filter(Boolean)

  if (!orderTypes.length && !oldModes.length) return null

  return {
    enabled: ordering.enabled === true && orderTypes.length > 0,
    order_types: orderTypes,
  }
}
const cleanData = (value) => {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(cleanData)
  if (typeof value !== 'object') return value
  if (typeof value.toDate === 'function') {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds }
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, cleanData(entry)])
  )
}

async function collectMenuDocs() {
  const docs = []
  const rootMenus = await db.collection('menus').get()
  rootMenus.docs.forEach((doc) => docs.push(doc))

  const apps = await db.collection('apps').get()
  for (const app of apps.docs) {
    const kitchens = await app.ref.collection('kitchens').get()
    for (const kitchen of kitchens.docs) {
      const menus = await kitchen.ref.collection('menus').get()
      menus.docs.forEach((doc) => docs.push(doc))
    }
  }

  return docs
}

const updates = []

for (const doc of await collectMenuDocs()) {
  const data = doc.data() || {}
  const nextOrdering = normalizeOrdering(data.ordering)

  if (!nextOrdering || JSON.stringify(cleanData(data.ordering)) === JSON.stringify(nextOrdering)) {
    continue
  }

  updates.push({
    path: doc.ref.path,
    before: cleanData(data.ordering),
    after: nextOrdering,
  })

  if (commit) {
    await doc.ref.update({ ordering: nextOrdering })
  }
}

console.log(JSON.stringify({
  commit,
  count: updates.length,
  updates,
}, null, 2))
