#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_KITCHEN_COLLECTION = 'kitchens'
const SYSTEM_ACTOR = 'system:migrate-misebox-menu-canon'

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = String(args.project || DEFAULT_PROJECT_ID).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const serviceAccountPath = String(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
).trim()
const kitchenCollection = String(
  args['kitchen-collection'] || DEFAULT_KITCHEN_COLLECTION
).trim()

function clean(value) {
  return String(value ?? '').trim()
}

function sourceLanguageForMenu(menu) {
  return clean(menu.source_language) ||
    clean(menu.source_locale) ||
    clean(menu.language) ||
    clean(menu.primary_language) ||
    'de'
}

function statusForMenu(menu) {
  const status = clean(menu.status)
  if (status === 'draft' || status === 'published' || status === 'archived') return status
  return menu.active === false ? 'draft' : 'published'
}

function priceForItem(item) {
  const price = Number(item?.price || 0)
  if (Number.isFinite(price) && price > 0) return price

  const options = Array.isArray(item?.price_options) ? item.price_options : []
  const option = options.find((entry) => Number(entry?.price || 0) > 0)
  const optionPrice = Number(option?.price || 0)

  return Number.isFinite(optionPrice) ? optionPrice : 0
}

function stampFrom(source, fallbackAppId = 'misebox-app') {
  if (source && typeof source === 'object' && !Array.isArray(source)) return source
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: fallbackAppId,
  }
}

function canonicalMenuPayload(menuSnap, kitchenId) {
  const menu = menuSnap.data() || {}
  const created = stampFrom(menu.created)

  return {
    id: clean(menu.id) || menuSnap.id,
    kitchen_id: kitchenId,
    name: clean(menu.name) || menuSnap.id,
    description: clean(menu.description),
    source_language: sourceLanguageForMenu(menu),
    status: statusForMenu(menu),
    ...(clean(menu.doc_url) ? { doc_url: clean(menu.doc_url) } : {}),
    ...(clean(menu.doc_name) ? { doc_name: clean(menu.doc_name) } : {}),
    ...(clean(menu.doc_type) ? { doc_type: clean(menu.doc_type) } : {}),
    ...(clean(menu.doc_storage_path) ? { doc_storage_path: clean(menu.doc_storage_path) } : {}),
    created,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
    active: FieldValue.delete(),
    defaults: FieldValue.delete(),
    design: FieldValue.delete(),
    design_packs: FieldValue.delete(),
    dish_ids: FieldValue.delete(),
    language: FieldValue.delete(),
    names: FieldValue.delete(),
    descriptions: FieldValue.delete(),
    note: FieldValue.delete(),
    notes: FieldValue.delete(),
    primary_language: FieldValue.delete(),
    public_menu_design: FieldValue.delete(),
    sections: FieldValue.delete(),
    service_modes: FieldValue.delete(),
    slug: FieldValue.delete(),
    sort_order: FieldValue.delete(),
    source_locale: FieldValue.delete(),
    translation_id: FieldValue.delete(),
    sproochli: FieldValue.delete(),
    sproochli_id: FieldValue.delete(),
  }
}

function canonicalSectionPayload(section, kitchenId, menuId, index, created) {
  return {
    id: clean(section.id) || `section-${String(index + 1).padStart(2, '0')}`,
    kitchen_id: kitchenId,
    menu_id: menuId,
    label: clean(section.label) || clean(section.name) || `Section ${index + 1}`,
    description: clean(section.description),
    status: section.active === false ? 'archived' : clean(section.status) || 'active',
    sort_order: Number(section.sort_order || index + 1),
    created,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

function canonicalItemPayload(item, kitchenId, menuId, sectionId, index, created) {
  return {
    id: clean(item.id) || `${sectionId}-${String(index + 1).padStart(2, '0')}`,
    kitchen_id: kitchenId,
    menu_id: menuId,
    section_id: sectionId,
    dish_id: clean(item.dish_id) || clean(item.id),
    price: priceForItem(item),
    status: item.active === false ? 'archived' : clean(item.status) || 'active',
    sort_order: Number(item.sort_order || index + 1),
    created,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

async function deleteCollection(db, collectionRef, batchOps) {
  const snap = await collectionRef.get()
  for (const doc of snap.docs) {
    batchOps.push((batch) => batch.delete(doc.ref))
    const subcollections = await doc.ref.listCollections()
    for (const subcollection of subcollections) {
      await deleteCollection(db, subcollection, batchOps)
    }
  }
}

async function commitOps(db, ops) {
  let committed = 0
  for (let index = 0; index < ops.length; index += 450) {
    const batch = db.batch()
    ops.slice(index, index + 450).forEach((operation) => operation(batch))
    await batch.commit()
    committed += Math.min(450, ops.length - index)
  }
  return committed
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `migrate-misebox-menu-canon-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
const kitchenSnaps = await db.collection(kitchenCollection).get()
const ops = []
const report = []

for (const kitchenSnap of kitchenSnaps.docs) {
  const kitchenId = kitchenSnap.id
  const menuSnaps = await kitchenSnap.ref.collection('menus').get()

  for (const menuSnap of menuSnaps.docs) {
    const menu = menuSnap.data() || {}
    const embeddedSections = Array.isArray(menu.sections) ? menu.sections : []
    const created = stampFrom(menu.created)
    const menuId = clean(menu.id) || menuSnap.id
    const menuRef = menuSnap.ref
    const existingSections = await menuRef.collection('sections').get()

    if (embeddedSections.length) {
      for (const sectionDoc of existingSections.docs) {
        await deleteCollection(db, sectionDoc.ref.collection('items'), ops)
        ops.push((batch) => batch.delete(sectionDoc.ref))
      }

      embeddedSections.forEach((section, sectionIndex) => {
        const sectionPayload = canonicalSectionPayload(
          section || {},
          kitchenId,
          menuId,
          sectionIndex,
          created
        )
        const sectionRef = menuRef.collection('sections').doc(sectionPayload.id)
        ops.push((batch) => batch.set(sectionRef, sectionPayload, { merge: false }))

        const items = Array.isArray(section?.items) ? section.items : []
        items.forEach((item, itemIndex) => {
          const itemPayload = canonicalItemPayload(
            item || {},
            kitchenId,
            menuId,
            sectionPayload.id,
            itemIndex,
            created
          )
          ops.push((batch) =>
            batch.set(
              sectionRef.collection('items').doc(itemPayload.id),
              itemPayload,
              { merge: false }
            )
          )
        })
      })
    }

    ops.push((batch) =>
      batch.set(menuRef, canonicalMenuPayload(menuSnap, kitchenId), { merge: true })
    )

    report.push({
      path: menuRef.path,
      sections: embeddedSections.length,
      items: embeddedSections.reduce(
        (count, section) => count + (Array.isArray(section?.items) ? section.items.length : 0),
        0
      ),
      existingSectionDocs: existingSections.size,
    })
  }
}

const committed = commit ? await commitOps(db, ops) : 0

console.log(JSON.stringify({
  commit,
  projectId,
  databaseId,
  kitchenCollection,
  menus: report.length,
  operations: ops.length,
  committed,
  report,
}, null, 2))
