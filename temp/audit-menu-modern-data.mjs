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

const text = (value) => String(value ?? '').trim()
const hasOwn = (data, key) => Object.prototype.hasOwnProperty.call(data, key)
const slugPart = (value) =>
  text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
const sourceFromRootMenu = (data) => ({
  appId: text(data.kitchen_app_id || data.source?.app_id),
  kitchenId: text(data.kitchen_id || data.source?.kitchen_id),
  kitchenSlug: text(data.kitchen_slug || data.source?.kitchen_slug),
  kitchenName: text(data.kitchen_name || data.source?.kitchen_name),
  menuId: text(data.kitchen_menu_id || data.source?.menu_id),
})
const orderingIssues = (data) => {
  const ordering = data.ordering && typeof data.ordering === 'object' && !Array.isArray(data.ordering)
    ? data.ordering
    : null
  const issues = []

  if (ordering?.modes) issues.push('ordering.modes')
  if (hasOwn(data, 'ordering_modes')) issues.push('ordering_modes')
  if (hasOwn(data, 'service_modes')) issues.push('service_modes')
  if (hasOwn(data, 'ordering_enabled')) issues.push('ordering_enabled')
  if (ordering?.enabled === true && !Array.isArray(ordering.order_types)) {
    issues.push('missing ordering.order_types')
  }

  return issues
}
const rootMenuSummary = (doc) => {
  const data = doc.data() || {}
  const source = sourceFromRootMenu(data)

  return {
    path: doc.ref.path,
    id: doc.id,
    name: text(data.name),
    status: text(data.status),
    kind: text(data.source_kind || data.kind),
    source,
    orderingIssues: orderingIssues(data),
    hasModernSource:
      Boolean(source.appId && source.kitchenId && source.kitchenSlug && source.menuId),
  }
}
const scopedMenuSummary = (doc, appId, kitchenId, kitchenSlug, kitchenName) => {
  const data = doc.data() || {}
  const publicSlug = [slugPart(kitchenSlug), slugPart(doc.id)].filter(Boolean).join('-')

  return {
    path: doc.ref.path,
    id: doc.id,
    name: text(data.name),
    status: text(data.status),
    appId,
    kitchenId,
    kitchenSlug,
    kitchenName,
    publicSlug,
    orderingIssues: orderingIssues(data),
  }
}

const rootMenusSnap = await db.collection('menus').get()
const rootMenus = rootMenusSnap.docs.map(rootMenuSummary)
const rootMenuIds = new Set(rootMenus.map((menu) => menu.id))
const rootKitchensSnap = await db.collection('kitchens').get()
const rootKitchens = new Map(
  rootKitchensSnap.docs.map((doc) => {
    const data = doc.data() || {}
    return [
      doc.id,
      {
        slug: text(data.slug),
        name: text(data.display_name || data.name || data.short_name),
      },
    ]
  })
)
const scopedMenus = []
const appsSnap = await db.collection('apps').get()

for (const appDoc of appsSnap.docs) {
  const kitchensSnap = await appDoc.ref.collection('kitchens').get()
  for (const kitchenDoc of kitchensSnap.docs) {
    const rootKitchen = rootKitchens.get(kitchenDoc.id) || {}
    const kitchenData = kitchenDoc.data() || {}
    const kitchenSlug = text(kitchenData.slug || rootKitchen.slug)
    const kitchenName = text(
      kitchenData.display_name ||
        kitchenData.name ||
        kitchenData.short_name ||
        rootKitchen.name
    )
    const menusSnap = await kitchenDoc.ref.collection('menus').get()

    menusSnap.docs.forEach((doc) => {
      scopedMenus.push(
        scopedMenuSummary(doc, appDoc.id, kitchenDoc.id, kitchenSlug, kitchenName)
      )
    })
  }
}

const publishedScopedMenus = scopedMenus.filter((menu) => menu.status === 'published')
const missingDoorways = publishedScopedMenus.filter(
  (menu) => menu.publicSlug && !rootMenuIds.has(menu.publicSlug)
)

console.log(JSON.stringify({
  counts: {
    rootMenus: rootMenus.length,
    scopedMenus: scopedMenus.length,
    publishedScopedMenus: publishedScopedMenus.length,
    rootMenusWithOrderingIssues: rootMenus.filter((menu) => menu.orderingIssues.length).length,
    scopedMenusWithOrderingIssues: scopedMenus.filter((menu) => menu.orderingIssues.length).length,
    missingDoorways: missingDoorways.length,
  },
  rootMenus: rootMenus.filter((menu) =>
    menu.orderingIssues.length || !menu.hasModernSource
  ),
  scopedMenus: scopedMenus.filter((menu) => menu.orderingIssues.length),
  missingDoorways,
}, null, 2))
