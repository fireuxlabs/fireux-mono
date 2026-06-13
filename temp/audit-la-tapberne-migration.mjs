#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const KITCHEN_SLUG = 'la-tapberne'
const GLOBAL_APP_ID = 'misebox-app'
const TENANT_APP_ID = 'la-tap-berne'

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
})
const db = getFirestore(app, DATABASE_ID)

const text = (value) => String(value ?? '').trim()

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

function kitchenSummary(snap) {
  if (!snap.exists) return null
  const data = snap.data() || {}

  return {
    path: snap.ref.path,
    id: snap.id,
    name: text(data.name || data.display_name || data.short_name),
    slug: text(data.slug),
    app_scope_state: text(data.app_scope_state),
    app_scope_app_id: text(data.app_scope_app_id),
    app_id: text(data.app_id),
    team_ids: Array.isArray(data.team_ids) ? data.team_ids.map(text).filter(Boolean) : [],
    operator_ids: Array.isArray(data.operator_ids)
      ? data.operator_ids.map(text).filter(Boolean)
      : [],
    style: clean(data.style || data.menu_style || null),
  }
}

function appSummary(snap) {
  if (!snap.exists) return null
  const data = snap.data() || {}

  return {
    path: snap.ref.path,
    id: snap.id,
    name: text(data.name || data.app_name),
    role: text(data.role),
    status: text(data.status),
    project_id: text(data.project_id),
    ecosystem_id: text(data.ecosystem_id),
    admin_ids: Array.isArray(data.admin_ids) ? data.admin_ids.map(text).filter(Boolean) : [],
  }
}

async function countCollection(path) {
  const snap = await db.collection(path).count().get()
  return snap.data().count || 0
}

async function listTree(ref, maxDepth = 4, depth = 0) {
  if (depth > maxDepth) return []

  const collections = await ref.listCollections()
  const rows = []

  for (const collection of collections) {
    const count = await countCollection(collection.path)
    rows.push({ path: collection.path, count })

    const docs = await collection.limit(25).get()
    for (const doc of docs.docs) {
      rows.push(...(await listTree(doc.ref, maxDepth, depth + 1)))
    }
  }

  return rows
}

async function listMenus(kitchenPath) {
  const snap = await db.collection(`${kitchenPath}/menus`).get()
  const rows = []

  for (const doc of snap.docs) {
    const data = doc.data() || {}
    const sections = await countCollection(`${doc.ref.path}/sections`)
    let items = 0
    const sectionDocs = await doc.ref.collection('sections').get()
    for (const sectionDoc of sectionDocs.docs) {
      items += await countCollection(`${sectionDoc.ref.path}/items`)
    }

    rows.push({
      path: doc.ref.path,
      id: doc.id,
      name: text(data.name),
      status: text(data.status),
      doc_url: text(data.doc_url),
      sections,
      items,
    })
  }

  return rows
}

const rootQuery = await db
  .collection('kitchens')
  .where('slug', '==', KITCHEN_SLUG)
  .limit(5)
  .get()
const rootKitchenSnap = rootQuery.docs[0] || null
const kitchenId = rootKitchenSnap?.id || ''

const appSnap = await db.collection('apps').doc(TENANT_APP_ID).get()
const globalKitchenSnap = kitchenId
  ? await db.doc(`apps/${GLOBAL_APP_ID}/kitchens/${kitchenId}`).get()
  : null
const tenantKitchenSnap = kitchenId
  ? await db.doc(`apps/${TENANT_APP_ID}/kitchens/${kitchenId}`).get()
  : null

const rootTree = kitchenId ? await listTree(db.doc(`kitchens/${kitchenId}`)) : []
const globalTree = kitchenId
  ? await listTree(db.doc(`apps/${GLOBAL_APP_ID}/kitchens/${kitchenId}`))
  : []
const tenantTree = kitchenId
  ? await listTree(db.doc(`apps/${TENANT_APP_ID}/kitchens/${kitchenId}`))
  : []

const rootMenus = kitchenId ? await listMenus(`kitchens/${kitchenId}`) : []
const globalMenus = kitchenId
  ? await listMenus(`apps/${GLOBAL_APP_ID}/kitchens/${kitchenId}`)
  : []
const tenantMenus = kitchenId
  ? await listMenus(`apps/${TENANT_APP_ID}/kitchens/${kitchenId}`)
  : []

const expectedTenantSource =
  rootKitchenSnap?.exists &&
  text(rootKitchenSnap.data()?.app_scope_state) === 'dedicated_app' &&
  text(rootKitchenSnap.data()?.app_scope_app_id) === TENANT_APP_ID

const staleMenuSources = [
  ...rootMenus.map((menu) => menu.path),
  ...globalMenus
    .filter((menu) => menu.status !== 'archived')
    .map((menu) => menu.path),
]

console.log(
  JSON.stringify(
    {
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      kitchenSlug: KITCHEN_SLUG,
      kitchenId,
      app: appSummary(appSnap),
      rootKitchen: kitchenSummary(rootKitchenSnap),
      globalAppKitchen: kitchenSummary(globalKitchenSnap),
      tenantAppKitchen: kitchenSummary(tenantKitchenSnap),
      menus: {
        root: rootMenus,
        globalApp: globalMenus,
        tenantApp: tenantMenus,
      },
      treeCounts: {
        root: rootTree,
        globalApp: globalTree,
        tenantApp: tenantTree,
      },
      verdict: {
        rootPointsToTenant: Boolean(expectedTenantSource),
        tenantKitchenExists: Boolean(tenantKitchenSnap?.exists),
        tenantPublishedMenus: tenantMenus.filter((menu) => menu.status === 'published').length,
        staleMenuSources,
        fullyMigratedEnough:
          Boolean(expectedTenantSource) &&
          Boolean(tenantKitchenSnap?.exists) &&
          tenantMenus.some((menu) => menu.status === 'published') &&
          staleMenuSources.length === 0,
      },
    },
    null,
    2
  )
)
