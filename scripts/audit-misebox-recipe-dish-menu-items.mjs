#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of Kitchen-scoped Recipe, Dish, and Menu Item relationship integrity in Misebox.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `recipe-dish-menu-items-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const issues = []
const counts = { apps: 0, kitchens: 0, recipes: 0, dishes: 0, menus: 0, sections: 0, items: 0 }
const issue = (kind, context) => issues.push({ kind, ...context })

const appSnapshot = await db.collection('apps').get()
counts.apps = appSnapshot.size

for (const appDoc of appSnapshot.docs) {
  const appId = appDoc.id
  const kitchenSnapshot = await appDoc.ref.collection('kitchens').get()
  counts.kitchens += kitchenSnapshot.size

  for (const kitchenDoc of kitchenSnapshot.docs) {
    const kitchenId = kitchenDoc.id
    const context = { app_id: appId, kitchen_id: kitchenId }
    const [recipeSnapshot, dishSnapshot, menuSnapshot] = await Promise.all([
      kitchenDoc.ref.collection('recipes').get(),
      kitchenDoc.ref.collection('dishes').get(),
      kitchenDoc.ref.collection('menus').get(),
    ])
    counts.recipes += recipeSnapshot.size
    counts.dishes += dishSnapshot.size
    counts.menus += menuSnapshot.size
    const dishIds = new Set(dishSnapshot.docs.map(doc => doc.id))

    for (const doc of recipeSnapshot.docs) {
      const data = doc.data() || {}
      if (text(data.kitchen_id) !== kitchenId) {
        issue('recipe_kitchen_mismatch', { ...context, recipe_id: doc.id, stored_kitchen_id: text(data.kitchen_id) })
      }
      if (!text(data.name)) issue('recipe_name_missing', { ...context, recipe_id: doc.id })
      if (text(data.id) && text(data.id) !== doc.id) {
        issue('recipe_id_mismatch', { ...context, recipe_id: doc.id, stored_id: text(data.id) })
      }
    }

    for (const doc of dishSnapshot.docs) {
      const data = doc.data() || {}
      if (text(data.kitchen_id) !== kitchenId) {
        issue('dish_kitchen_mismatch', { ...context, dish_id: doc.id, stored_kitchen_id: text(data.kitchen_id) })
      }
      if (!text(data.name)) issue('dish_name_missing', { ...context, dish_id: doc.id })
      if (text(data.id) && text(data.id) !== doc.id) {
        issue('dish_id_mismatch', { ...context, dish_id: doc.id, stored_id: text(data.id) })
      }
    }

    for (const menuDoc of menuSnapshot.docs) {
      const menuId = menuDoc.id
      const menu = menuDoc.data() || {}
      const menuContext = { ...context, menu_id: menuId }
      if (text(menu.kitchen_id) !== kitchenId) {
        issue('menu_kitchen_mismatch', { ...menuContext, stored_kitchen_id: text(menu.kitchen_id) })
      }

      const sectionSnapshot = await menuDoc.ref.collection('sections').get()
      counts.sections += sectionSnapshot.size
      for (const sectionDoc of sectionSnapshot.docs) {
        const sectionId = sectionDoc.id
        const section = sectionDoc.data() || {}
        const sectionContext = { ...menuContext, section_id: sectionId }
        if (text(section.kitchen_id) !== kitchenId || text(section.menu_id) !== menuId) {
          issue('menu_section_scope_mismatch', {
            ...sectionContext,
            stored_kitchen_id: text(section.kitchen_id),
            stored_menu_id: text(section.menu_id),
          })
        }

        const itemSnapshot = await sectionDoc.ref.collection('items').get()
        counts.items += itemSnapshot.size
        for (const itemDoc of itemSnapshot.docs) {
          const item = itemDoc.data() || {}
          const itemContext = { ...sectionContext, item_id: itemDoc.id }
          if (
            text(item.kitchen_id) !== kitchenId ||
            text(item.menu_id) !== menuId ||
            text(item.section_id) !== sectionId
          ) {
            issue('menu_item_scope_mismatch', {
              ...itemContext,
              stored_kitchen_id: text(item.kitchen_id),
              stored_menu_id: text(item.menu_id),
              stored_section_id: text(item.section_id),
            })
          }
          const dishId = text(item.dish_id)
          if (!dishId) issue('menu_item_dish_missing', itemContext)
          else if (!dishIds.has(dishId)) issue('menu_item_dish_not_found', { ...itemContext, dish_id: dishId })
        }
      }
    }
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: { ...counts, issues: issues.length },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
