#!/usr/bin/env node
/*
  Firestore migration: canonicalize La Tapberne menu items into dishes.

  Reads:
    kitchens/{kitchenId}/menus/*

  Writes (commit mode only):
    kitchens/{kitchenId}/dishes/{dishId}
    kitchens/{kitchenId}/menus/{menuId} (sections[].items[].dish_id only when needed)

  Guarantees:
    - Deterministic dish id generation from normalized labels
    - Idempotent create/update behavior
    - No writes in dry-run mode
    - No unrelated collections touched

  Default kitchen is La Tapberne:
    ChIJ08WSgYSjj0cRD6oE3RwUFk0

  Usage:
    node scripts/migrate-tapberne-menu-items-to-dishes.mjs --project <projectId>
    node scripts/migrate-tapberne-menu-items-to-dishes.mjs --project <projectId> --commit

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const DEFAULT_MAIN_MENU_ID = 'menu-main'

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const kitchenId = String(args.kitchen || DEFAULT_KITCHEN_ID).trim()
const appId = String(args['app-id'] || args.appId || 'misebox-app').trim()
const creatorId = String(args['creator-id'] || args.creatorId || '').trim()
const mainMenuId = String(args['main-menu-id'] || args.mainMenuId || DEFAULT_MAIN_MENU_ID).trim()

if (help) {
  console.log('\nFirestore migration: canonicalize Tapberne menu items into dishes\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-tapberne-menu-items-to-dishes.mjs --project <projectId>')
  console.log('  node scripts/migrate-tapberne-menu-items-to-dishes.mjs --project <projectId> --commit')
  console.log('\nOptions:')
  console.log('  --kitchen <id>       kitchen id (default: La Tapberne)')
  console.log('  --main-menu-id <id>  source menu id for sort order (default: menu-main)')
  console.log('  --app-id <id>        app_id for newly created dishes (default: misebox-app)')
  console.log('  --creator-id <uid>   creator_id for newly created dishes (default: empty)')
  console.log('\nAuth (one required):')
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)')
  console.log('  - FIREBASE_SERVICE_ACCOUNT (JSON string)')
  console.log('  - Or Google ADC (gcloud): application-default login')
  process.exit(0)
}

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!kitchenId) {
  console.error('Missing --kitchen (or default kitchen id).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

const normalizeLabel = (value) =>
  String(value || '')
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/ß/g, 'ss')
    .replace(/ẞ/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'ue')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toDishSlug = (label) => normalizeLabel(label).replace(/\s+/g, '-').replace(/-+/g, '-')

const toDishId = (label) => {
  const slug = toDishSlug(label)
  return `dish-${slug || 'item'}`
}

const asArray = (value) => (Array.isArray(value) ? value : [])

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

console.log('[migrate] tapberne-menu-items-to-dishes start', {
  projectId,
  kitchenId,
  mainMenuId,
  appId,
  commit,
})

const kitchenRef = db.collection('kitchens').doc(kitchenId)
const kitchenSnap = await kitchenRef.get()
if (!kitchenSnap.exists) {
  console.error('[migrate] missing_kitchen', { kitchenPath: kitchenRef.path })
  process.exit(2)
}

const menusSnap = await kitchenRef.collection('menus').get()
if (menusSnap.empty) {
  console.log('[migrate] no_menus', { kitchenPath: kitchenRef.path })
  process.exit(0)
}

const menuDocs = menusSnap.docs
  .map((docSnap) => ({ id: docSnap.id, ref: docSnap.ref, data: docSnap.data() || {} }))
  .sort((a, b) => {
    if (a.id === mainMenuId) return -1
    if (b.id === mainMenuId) return 1
    return String(a.id).localeCompare(String(b.id))
  })

const mainMenu = menuDocs.find((menu) => menu.id === mainMenuId)
if (!mainMenu) {
  console.error('[migrate] missing_main_menu', {
    expectedMenuId: mainMenuId,
    foundMenus: menuDocs.map((menu) => menu.id),
  })
  process.exit(3)
}

const sortOrderByKey = new Map()
let appearanceCounter = 1
for (const section of asArray(mainMenu.data.sections)) {
  for (const item of asArray(section?.items)) {
    const label = String(item?.label || '').trim()
    const key = normalizeLabel(label)
    if (!key) continue
    if (sortOrderByKey.has(key)) continue
    sortOrderByKey.set(key, appearanceCounter)
    appearanceCounter += 1
  }
}

const uniqueByKey = new Map()
for (const menu of menuDocs) {
  for (const section of asArray(menu.data.sections)) {
    for (const menuItem of asArray(section?.items)) {
      const label = String(menuItem?.label || '').trim()
      const description = String(menuItem?.description || '').trim()
      const key = normalizeLabel(label)
      if (!key) continue
      if (uniqueByKey.has(key)) continue
      uniqueByKey.set(key, {
        key,
        label,
        description,
      })
    }
  }
}

const uniqueItems = [...uniqueByKey.values()].sort((a, b) => {
  const aSort = Number(sortOrderByKey.get(a.key) || Number.MAX_SAFE_INTEGER)
  const bSort = Number(sortOrderByKey.get(b.key) || Number.MAX_SAFE_INTEGER)
  if (aSort !== bSort) return aSort - bSort
  return a.key.localeCompare(b.key)
})

const dishRefs = uniqueItems.map((entry) => {
  const dishId = toDishId(entry.label)
  const sortOrder = Number(sortOrderByKey.get(entry.key) || 0)
  return {
    ...entry,
    dishId,
    sortOrder,
    ref: kitchenRef.collection('dishes').doc(dishId),
  }
})

const existingDishSnaps = await db.getAll(...dishRefs.map((entry) => entry.ref))
const existingDishById = new Map(existingDishSnaps.map((snap) => [snap.id, snap]))

let plannedDishCreates = 0
let plannedMenuUpdates = 0
let alreadyCorrectMenuItems = 0

for (const entry of dishRefs) {
  const exists = Boolean(existingDishById.get(entry.dishId)?.exists)
  if (exists) continue
  plannedDishCreates += 1
}

for (const menu of menuDocs) {
  const sections = asArray(menu.data.sections)
  let needsUpdate = false
  const nextSections = sections.map((section) => {
    const items = asArray(section?.items)
    const nextItems = items.map((menuItem) => {
      const label = String(menuItem?.label || '').trim()
      const key = normalizeLabel(label)
      if (!key) return menuItem

      const canonicalDishId = toDishId(label)
      const currentDishId = String(menuItem?.dish_id || '').trim()

      if (currentDishId === canonicalDishId) {
        alreadyCorrectMenuItems += 1
        return menuItem
      }

      needsUpdate = true
      return {
        ...menuItem,
        dish_id: canonicalDishId,
      }
    })

    return {
      ...section,
      items: nextItems,
    }
  })

  if (!needsUpdate) continue
  plannedMenuUpdates += 1

  menu.nextSections = nextSections
}

console.log('[migrate] analysis', {
  menusFound: menuDocs.length,
  uniqueItems: uniqueItems.length,
  plannedDishCreates,
  plannedMenuUpdates,
  alreadyCorrectMenuItems,
})

for (const entry of dishRefs) {
  const exists = Boolean(existingDishById.get(entry.dishId)?.exists)
  if (exists) {
    console.log('[exists-dish]', entry.dishId, { label: entry.label, sort_order: entry.sortOrder })
    continue
  }

  const payload = {
    id: entry.dishId,
    kitchen_id: kitchenId,
    name: entry.label,
    description: entry.description,
    image_url: '',
    recipe_ids: [],
    ingredient_ids: [],
    mise_ids: [],
    active: true,
    sort_order: entry.sortOrder,
    app_id: appId,
    creator_id: creatorId,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }

  if (!commit) {
    console.log('[dry-run-create-dish]', entry.ref.path, {
      id: payload.id,
      name: payload.name,
      sort_order: payload.sort_order,
    })
    continue
  }

  await entry.ref.set(payload, { merge: false })
  console.log('[create-dish]', entry.ref.path, {
    id: payload.id,
    name: payload.name,
    sort_order: payload.sort_order,
  })
}

for (const menu of menuDocs) {
  if (!menu.nextSections) continue

  const updates = []
  for (const section of asArray(menu.nextSections)) {
    for (const menuItem of asArray(section?.items)) {
      const label = String(menuItem?.label || '').trim()
      const key = normalizeLabel(label)
      if (!key) continue
      updates.push({
        label,
        dish_id: String(menuItem?.dish_id || '').trim(),
      })
    }
  }

  if (!commit) {
    console.log('[dry-run-update-menu]', menu.ref.path, {
      sections: asArray(menu.nextSections).length,
      itemMappings: updates.length,
      updates,
    })
    continue
  }

  await menu.ref.update({
    sections: menu.nextSections,
    updated_at: FieldValue.serverTimestamp(),
  })

  console.log('[update-menu]', menu.ref.path, {
    sections: asArray(menu.nextSections).length,
    itemMappings: updates.length,
  })
}

console.log('[migrate] tapberne-menu-items-to-dishes done', {
  commit,
  kitchenPath: kitchenRef.path,
  uniqueItems: uniqueItems.length,
  plannedDishCreates,
  plannedMenuUpdates,
})
