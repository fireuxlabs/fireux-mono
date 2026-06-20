#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const serviceAccountPath =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
const appId = 'misebox-app'
const kitchenId = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const menuId = process.argv.includes('--menu')
  ? process.argv[process.argv.indexOf('--menu') + 1]
  : 'main-menu'

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
})

const db = getFirestore(app, 'misebox')
const basePath = `apps/${appId}/kitchens/${kitchenId}`
const menuRef = db.doc(`${basePath}/menus/${menuId}`)
const uploadRef = db.doc(`${basePath}/menu-uploads/${menuId}`)
const [menuSnap, uploadSnap, dishesSnap] = await Promise.all([
  menuRef.get(),
  uploadRef.get(),
  db.collection(`${basePath}/dishes`).count().get(),
])

const sections = []
if (menuSnap.exists) {
  const sectionsSnap = await menuRef.collection('sections').get()

  for (const sectionDoc of sectionsSnap.docs) {
    const itemsSnap = await sectionDoc.ref.collection('items').get()
    sections.push({
      id: sectionDoc.id,
      label: String(sectionDoc.data().label || ''),
      itemsCount: itemsSnap.size,
    })
  }
}

console.log(JSON.stringify({
  appId,
  kitchenId,
  menuId,
  menuExists: menuSnap.exists,
  menu: menuSnap.exists
    ? {
        id: menuSnap.id,
        name: String(menuSnap.data().name || ''),
        status: String(menuSnap.data().status || ''),
        kitchenId: String(menuSnap.data().kitchen_id || ''),
      }
    : null,
  sectionsCount: sections.length,
  itemsCount: sections.reduce((count, section) => count + section.itemsCount, 0),
  sections,
  dishesCount: Number(dishesSnap.data().count || 0),
  upload: uploadSnap.exists
    ? {
        id: uploadSnap.id,
        status: String(uploadSnap.data().status || ''),
        filesCount: Number(uploadSnap.data().files_count || 0),
        fileKind: String(uploadSnap.data().file_kind || ''),
      }
    : null,
}, null, 2))
