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

async function count(path) {
  const snap = await db.collection(path).count().get()
  return Number(snap.data().count || 0)
}

async function inspectKitchenMenu(menu) {
  const sourcePath = `apps/${menu.kitchen_app_id}/kitchens/${menu.kitchen_id}/menus/${menu.kitchen_menu_id}`
  const menuSnap = await db.doc(sourcePath).get()
  const menuData = menuSnap.data() || {}
  const sectionsSnap = await db.collection(`${sourcePath}/sections`).get()
  let itemCount = 0

  for (const section of sectionsSnap.docs) {
    itemCount += await count(`${section.ref.path}/items`)
  }

  return {
    public_menu_id: menu.id,
    public_path: `/menus/${menu.id}`,
    source_path: sourcePath,
    source_exists: menuSnap.exists,
    source_status: text(menuData.status),
    kitchen_name: text(menu.kitchen_name),
    menu_name: text(menuData.name || menu.name),
    has_source_document: Boolean(text(menuData.doc_url)),
    sections: sectionsSnap.size,
    items: itemCount,
    dishes: await count(`apps/${menu.kitchen_app_id}/kitchens/${menu.kitchen_id}/dishes`),
    maturity:
      sectionsSnap.size > 0 || itemCount > 0
        ? 'structured'
        : text(menuData.doc_url)
          ? 'source'
          : 'doorway',
  }
}

async function inspectRootMenu(menu) {
  return {
    public_menu_id: menu.id,
    public_path: `/menus/${menu.id}`,
    source_path: `menus/${menu.id}`,
    source_exists: true,
    source_status: text(menu.status),
    kitchen_name: '',
    menu_name: text(menu.name),
    has_source_document: Boolean(text(menu.doc_url)),
    sections: 0,
    items: 0,
    dishes: 0,
    maturity: text(menu.doc_url) ? 'source' : 'doorway',
  }
}

const menusSnap = await db.collection('menus').get()
const rows = []

for (const doc of menusSnap.docs) {
  const menu = {
    id: doc.id,
    ...(doc.data() || {}),
  }
  const hasKitchenSource =
    text(menu.kitchen_app_id) &&
    text(menu.kitchen_id) &&
    text(menu.kitchen_menu_id)

  rows.push(
    hasKitchenSource
      ? await inspectKitchenMenu(menu)
      : await inspectRootMenu(menu)
  )
}

console.log(JSON.stringify({
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  rows: rows.sort((a, b) => a.public_menu_id.localeCompare(b.public_menu_id)),
}, null, 2))
