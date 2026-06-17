#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const ACTOR = 'system:reconcile-public-menu-surfaces'
const write = process.argv.includes('--write')

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(app, DATABASE_ID)

const text = (value) => String(value ?? '').trim()
const isArchived = (data) => text(data.status).toLowerCase() === 'archived'
const slugPart = (value) =>
  text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function surfaceSlug(kitchenSlug, menuId, menuData) {
  return [slugPart(kitchenSlug), slugPart(menuData.slug || menuId)]
    .filter(Boolean)
    .join('-')
}

function surfaceRecord(source) {
  const menu = source.menuData
  const now = Timestamp.now()

  return {
    id: source.publicSlug,
    slug: source.publicSlug,
    name: text(menu.name) || source.publicSlug,
    description: text(menu.description),
    status: text(menu.status),
    kitchen_id: source.kitchenId,
    kitchen_slug: source.kitchenSlug,
    kitchen_app_id: source.appId,
    kitchen_menu_id: source.menuId,
    source_kind: 'kitchen-menu',
    source_path: source.sourcePath,
    path: `/menus/${source.publicSlug}`,
    qr_path: `/menus/${source.publicSlug}/qr`,
    doc_url: text(menu.doc_url),
    doc_name: text(menu.doc_name),
    doc_type: text(menu.doc_type),
    doc_storage_path: text(menu.doc_storage_path),
    updated: {
      at: now,
      by: ACTOR,
    },
  }
}

async function appKitchenCandidates(rootKitchenById) {
  const rows = []
  const apps = await db.collection('apps').get()

  for (const appDoc of apps.docs) {
    const kitchens = await appDoc.ref.collection('kitchens').get()

    for (const kitchenDoc of kitchens.docs) {
      const rootKitchen = rootKitchenById.get(kitchenDoc.id)?.data() || {}
      const kitchen = {
        ...rootKitchen,
        ...(kitchenDoc.data() || {}),
      }
      const kitchenSlug = text(kitchen.slug)
      const menus = await kitchenDoc.ref.collection('menus').get()

      for (const menuDoc of menus.docs) {
        const menuData = menuDoc.data() || {}
        if (isArchived(menuData)) continue

        const publicSlug = surfaceSlug(kitchenSlug, menuDoc.id, menuData)
        if (!publicSlug) continue

        rows.push({
          appId: appDoc.id,
          kitchenId: kitchenDoc.id,
          kitchenSlug,
          menuId: menuDoc.id,
          menuData,
          sourcePath: menuDoc.ref.path,
          publicSlug,
        })
      }
    }
  }

  return rows
}

async function rootKitchenCandidates(rootKitchenDocs, appKeys) {
  const rows = []

  for (const kitchenDoc of rootKitchenDocs) {
    const kitchen = kitchenDoc.data() || {}
    const kitchenSlug = text(kitchen.slug)
    const menus = await kitchenDoc.ref.collection('menus').get()

    for (const menuDoc of menus.docs) {
      const menuData = menuDoc.data() || {}
      const key = `${kitchenDoc.id}:${menuDoc.id}`
      if (isArchived(menuData) || appKeys.has(key)) continue

      const publicSlug = surfaceSlug(kitchenSlug, menuDoc.id, menuData)
      if (!publicSlug) continue

      rows.push({
        appId: text(kitchen.app_scope_app_id || kitchen.app_id),
        kitchenId: kitchenDoc.id,
        kitchenSlug,
        menuId: menuDoc.id,
        menuData,
        sourcePath: menuDoc.ref.path,
        publicSlug,
      })
    }
  }

  return rows
}

const rootKitchenSnap = await db.collection('kitchens').get()
const rootKitchenDocs = rootKitchenSnap.docs
const rootKitchenById = new Map(rootKitchenDocs.map((doc) => [doc.id, doc]))
const appCandidates = await appKitchenCandidates(rootKitchenById)
const appKeys = new Set(
  appCandidates.map((row) => `${row.kitchenId}:${row.menuId}`)
)
const rootCandidates = await rootKitchenCandidates(rootKitchenDocs, appKeys)
const candidatesBySlug = new Map()

for (const candidate of [...rootCandidates, ...appCandidates]) {
  candidatesBySlug.set(candidate.publicSlug, candidate)
}

const candidates = [...candidatesBySlug.values()].sort((a, b) =>
  a.publicSlug.localeCompare(b.publicSlug)
)
const existingRootMenus = await db.collection('menus').get()
const existingRootIds = new Set(existingRootMenus.docs.map((doc) => doc.id))
const rows = []

for (const candidate of candidates) {
  const ref = db.collection('menus').doc(candidate.publicSlug)
  const exists = existingRootIds.has(candidate.publicSlug)
  const record = surfaceRecord(candidate)

  rows.push({
    publicSlug: candidate.publicSlug,
    publicPath: record.path,
    sourcePath: candidate.sourcePath,
    exists,
    action: write ? 'upsert' : exists ? 'would-update' : 'would-create',
  })

  if (write) {
    const snap = await ref.get()
    await ref.set(
      {
        ...record,
        created: snap.exists
          ? snap.data()?.created
          : {
              at: Timestamp.now(),
              by: ACTOR,
              app_id: candidate.appId,
            },
      },
      { merge: true }
    )
  }
}

console.log(JSON.stringify({
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  write,
  count: rows.length,
  rows,
}, null, 2))
