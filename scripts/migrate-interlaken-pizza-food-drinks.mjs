#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-09-03
// usage_note: split Interlaken Pizza's classified mixed Menu into canonical Food and Drinks Menus.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const KITCHEN_ID = 'ChIJWcym7tulj0cRb3N2twqVj1U'
const SOURCE_MENU_ID = 'pizza-menu'
const FOOD_ROOT_ID = 'pizza-menu'
const DRINKS_ROOT_ID = 'interlaken-pizza-drinks'
const ACTOR = 'system:migrate-interlaken-pizza-food-drinks'
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stable(child)]))
}
const sha256 = (value) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const target = (key, collectionPath, verbs) => defineFirestoreMutationTarget({
  key,
  lane: 'mcp-skill',
  verbs,
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath,
})

if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)
}

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `migrate-interlaken-menu-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const kitchenRef = db.doc(`kitchens/${KITCHEN_ID}`)
const sourceRef = kitchenRef.collection('menus').doc(SOURCE_MENU_ID)
const foodRef = kitchenRef.collection('menus').doc('food')
const drinksRef = kitchenRef.collection('menus').doc('drinks')
const foodRootRef = db.doc(`menus/${FOOD_ROOT_ID}`)
const drinksRootRef = db.doc(`menus/${DRINKS_ROOT_ID}`)
const [kitchen, source, food, drinks, foodRoot, drinksRoot] = await db.getAll(
  kitchenRef,
  sourceRef,
  foodRef,
  drinksRef,
  foodRootRef,
  drinksRootRef
)
if (![kitchen, source, food, drinks, foodRoot].every((snap) => snap.exists)) throw new Error('Required migration source is missing.')
if (drinksRoot.exists) throw new Error(`Target root Menu already exists: ${drinksRootRef.path}`)

const sourceSections = await sourceRef.collection('sections').orderBy('sort_order').get()
const sections = []
for (const section of sourceSections.docs) {
  const itemSnapshot = await section.ref.collection('items').orderBy('sort_order').get()
  const items = []
  for (const item of itemSnapshot.docs) {
    const data = item.data() || {}
    const dishId = text(data.dish_id)
    const dish = await kitchenRef.collection('dishes').doc(dishId).get()
    const kind = text(dish.get('item_kind')) || text(data.item_kind)
    if (kind !== 'food' && kind !== 'drink') throw new Error(`Unclassified item: ${item.ref.path}`)
    items.push({ id: item.id, kind, data })
  }
  sections.push({ id: section.id, data: section.data() || {}, items })
}
const foodItems = sections.flatMap((section) => section.items.filter((item) => item.kind === 'food'))
const drinkItems = sections.flatMap((section) => section.items.filter((item) => item.kind === 'drink'))
if (foodItems.length !== 83 || drinkItems.length !== 36) {
  throw new Error(`Expected 83 Food and 36 Drink items; found ${foodItems.length} and ${drinkItems.length}.`)
}
for (const destination of [foodRef, drinksRef]) {
  const existingSections = await destination.collection('sections').limit(1).get()
  if (!existingSections.empty) throw new Error(`Target Menu is not empty: ${destination.path}`)
}

const plan = {
  format: 'misebox-interlaken-pizza-food-drinks-plan/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  kitchenId: KITCHEN_ID,
  sourceMenuId: SOURCE_MENU_ID,
  food: { menuId: 'food', rootMenuId: FOOD_ROOT_ID, items: foodItems.length },
  drinks: { menuId: 'drinks', rootMenuId: DRINKS_ROOT_ID, items: drinkItems.length },
  sourceSha256: sha256({ kitchen: kitchen.data(), source: source.data(), sections: sections.map(stable), foodRoot: foodRoot.data() }),
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm=${planSha256}.`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) throw new Error('Apply requires --backup=/private/tmp/<name>.json.')
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'misebox-interlaken-pizza-food-drinks-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    documents: [kitchen, source, food, drinks, foodRoot, drinksRoot].map((snap) => ({ path: snap.ref.path, exists: snap.exists, data: stable(snap.data()) })),
    sections: sections.map(stable),
  },
})
const now = Timestamp.now()
const menuTarget = target('misebox.interlaken-menu-split.menus', `kitchens/${KITCHEN_ID}/menus`, ['update'])
const rootTarget = target('misebox.interlaken-menu-split.root-menus', 'menus', ['create', 'update'])
const kitchenTarget = target('misebox.interlaken-menu-split.kitchen', 'kitchens', ['update'])
const sourceData = source.data() || {}
for (const [menuId, kind, name] of [['food', 'food', 'Food'], ['drinks', 'drinks', 'Drinks']]) {
  const current = menuId === 'food' ? food.data() || {} : drinks.data() || {}
  await mcpSkillUpdate(app, menuTarget, menuId, {
    ...sourceData,
    kitchen_id: KITCHEN_ID,
    system_kind: kind,
    name,
    status: 'published',
    sort_order: kind === 'food' ? 10 : 20,
    created: current.created,
    updated: { at: now, by: ACTOR },
  })
  for (const section of sections) {
    const selected = section.items.filter((item) => item.kind === kind.slice(0, -1) || item.kind === kind)
    if (!selected.length) continue
    const sectionTarget = target(`misebox.interlaken-menu-split.${menuId}.${section.id}`, `kitchens/${KITCHEN_ID}/menus/${menuId}/sections`, ['create'])
    await mcpSkillCreate(app, sectionTarget, section.id, { ...section.data, kitchen_id: KITCHEN_ID, menu_id: menuId, updated: { at: now, by: ACTOR } })
    const itemTarget = target(`misebox.interlaken-menu-split.${menuId}.${section.id}.items`, `kitchens/${KITCHEN_ID}/menus/${menuId}/sections/${section.id}/items`, ['create'])
    for (const item of selected) await mcpSkillCreate(app, itemTarget, item.id, { ...item.data, kitchen_id: KITCHEN_ID, menu_id: menuId, section_id: section.id, updated: { at: now, by: ACTOR } })
  }
}
await mcpSkillUpdate(app, rootTarget, FOOD_ROOT_ID, { name: 'Food', source: { ...foodRoot.get('source'), menu_id: 'food' }, updated: { at: now, by: ACTOR } })
await mcpSkillCreate(app, rootTarget, DRINKS_ROOT_ID, { kind: 'menu', name: 'Drinks', description: text(sourceData.description), status: 'published', source: { ...foodRoot.get('source'), menu_id: 'drinks' }, created: { at: now, by: ACTOR, app_id: text(foodRoot.get('source.app_id')) }, updated: { at: now, by: ACTOR } })
await mcpSkillUpdate(app, kitchenTarget, KITCHEN_ID, { 'menus.primary_menu_id': 'food', updated: { at: now, by: ACTOR } })

const [verifiedFood, verifiedDrinks, verifiedFoodRoot, verifiedDrinksRoot, verifiedKitchen] = await db.getAll(foodRef, drinksRef, foodRootRef, drinksRootRef, kitchenRef)
const countItems = async (menuRef) => {
  const sectionSnapshot = await menuRef.collection('sections').get()
  let count = 0
  for (const section of sectionSnapshot.docs) count += (await section.ref.collection('items').count().get()).data().count
  return count
}
const verification = {
  foodItems: await countItems(foodRef),
  drinkItems: await countItems(drinksRef),
  foodRootSource: text(verifiedFoodRoot.get('source.menu_id')),
  drinksRootSource: text(verifiedDrinksRoot.get('source.menu_id')),
  primaryMenuId: text(verifiedKitchen.get('menus.primary_menu_id')),
  foodStatus: text(verifiedFood.get('status')),
  drinksStatus: text(verifiedDrinks.get('status')),
}
if (verification.foodItems !== 83 || verification.drinkItems !== 36 || verification.foodRootSource !== 'food' || verification.drinksRootSource !== 'drinks' || verification.primaryMenuId !== 'food' || verification.foodStatus !== 'published' || verification.drinksStatus !== 'published') throw new Error(`Verification failed. Backup: ${backup.path}`)
console.log(JSON.stringify({ mode: 'apply', ok: true, plan_sha256: planSha256, backup, verification }, null, 2))
await deleteApp(app)
