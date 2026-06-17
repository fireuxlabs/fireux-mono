#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

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

function clean(value) {
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

function menuSummary(doc, data, source) {
  const kitchenSlug = slugPart(source.kitchenSlug)
  const menuSlug = slugPart(data.slug || doc.id)
  const publicSlug = source.kind === 'root'
    ? menuSlug
    : [kitchenSlug, menuSlug].filter(Boolean).join('-')

  return {
    source,
    sourcePath: doc.ref.path,
    id: doc.id,
    name: text(data.name) || doc.id,
    description: text(data.description),
    status: text(data.status),
    slug: text(data.slug),
    doc_url: text(data.doc_url),
    doc_name: text(data.doc_name),
    doc_type: text(data.doc_type),
    kitchen_id: text(data.kitchen_id || source.kitchenId),
    kitchen_slug: text(data.kitchen_slug || source.kitchenSlug),
    kitchen_app_id: text(data.kitchen_app_id || source.appId),
    kitchen_menu_id: text(data.kitchen_menu_id || doc.id),
    publicSlug,
    publicPath: publicSlug ? `/menus/${publicSlug}` : '',
    archived: isArchived(data),
    raw: clean(data),
  }
}

async function readRootMenus() {
  const snap = await db.collection('menus').get()
  return snap.docs.map((doc) =>
    menuSummary(doc, doc.data() || {}, { kind: 'root' })
  )
}

async function readRootKitchenMenus(rootKitchenDocs) {
  const rows = []

  for (const kitchenDoc of rootKitchenDocs) {
    const kitchen = kitchenDoc.data() || {}
    const menus = await kitchenDoc.ref.collection('menus').get()

    for (const menuDoc of menus.docs) {
      rows.push(menuSummary(menuDoc, menuDoc.data() || {}, {
        kind: 'root-kitchen',
        kitchenId: kitchenDoc.id,
        kitchenSlug: text(kitchen.slug),
      }))
    }
  }

  return rows
}

async function readAppKitchenMenus(rootKitchenById) {
  const rows = []
  const apps = await db.collection('apps').get()

  for (const appDoc of apps.docs) {
    const kitchens = await appDoc.ref.collection('kitchens').get()

    for (const kitchenDoc of kitchens.docs) {
      const rootKitchen = rootKitchenById.get(kitchenDoc.id) || null
      const kitchen = {
        ...(rootKitchen?.data() || {}),
        ...(kitchenDoc.data() || {}),
      }
      const menus = await kitchenDoc.ref.collection('menus').get()

      for (const menuDoc of menus.docs) {
        rows.push(menuSummary(menuDoc, menuDoc.data() || {}, {
          kind: 'app-kitchen',
          appId: appDoc.id,
          kitchenId: kitchenDoc.id,
          kitchenSlug: text(kitchen.slug),
        }))
      }
    }
  }

  return rows
}

const rootKitchenSnap = await db.collection('kitchens').get()
const rootKitchenDocs = rootKitchenSnap.docs
const rootKitchenById = new Map(rootKitchenDocs.map((doc) => [doc.id, doc]))
const [rootMenus, rootKitchenMenus, appKitchenMenus] = await Promise.all([
  readRootMenus(),
  readRootKitchenMenus(rootKitchenDocs),
  readAppKitchenMenus(rootKitchenById),
])

const existingRootIds = new Set(rootMenus.map((menu) => menu.id))
const existingRootSlugs = new Set(rootMenus.map((menu) => menu.slug || menu.id))
const scopedMenus = [...rootKitchenMenus, ...appKitchenMenus]
const scopedPublicNeeds = scopedMenus
  .filter((menu) => !menu.archived)
  .map((menu) => ({
    ...menu,
    hasPublicDoc:
      existingRootIds.has(menu.publicSlug) ||
      existingRootSlugs.has(menu.publicSlug),
  }))

console.log(JSON.stringify({
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  counts: {
    rootMenus: rootMenus.length,
    rootKitchenMenus: rootKitchenMenus.length,
    appKitchenMenus: appKitchenMenus.length,
    scopedPublicNeeds: scopedPublicNeeds.length,
    missingPublicSurfaces: scopedPublicNeeds.filter((menu) => !menu.hasPublicDoc).length,
  },
  rootMenus: rootMenus.map(({ raw, ...menu }) => menu),
  scopedMenus: scopedPublicNeeds.map(({ raw, ...menu }) => menu),
}, null, 2))
