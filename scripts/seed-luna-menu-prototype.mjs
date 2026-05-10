#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const DEFAULT_SEED_PATH = 'scripts/data/luna-piccante.menu.seed.json'
const SYSTEM_ACTOR = 'system:seed-luna-menu-prototype'
const APP_ID = 'misebox-app'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeIdList = (value) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

async function readSeed(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Luna menu seed')
  return { seed: data, resolvedPath }
}

function printHelp() {
  console.log(`
Seed Luna Piccante public semantic menu prototype from one frozen source file.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-menu-prototype.mjs [--commit]

Options:
  --commit                         Write the seed data.
  --seed <path>                    Seed JSON path. Defaults to scripts/data/luna-piccante.menu.seed.json.
  --project <id>                   Google/Firebase project id. Defaults to service-account project or misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function duplicateIds(entries, label) {
  const counts = new Map()
  for (const entry of entries) {
    const id = normalizeString(entry?.id)
    if (!id) continue
    counts.set(id, (counts.get(id) || 0) + 1)
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => `${label}:${id}`)
}

function collectIntegrityNotes(seed) {
  const notes = []
  for (const item of Array.isArray(seed.mise) ? seed.mise : []) {
    if (normalizeString(item.integrity_note)) {
      notes.push({ scope: 'mise', id: normalizeString(item.id), note: item.integrity_note })
    }
  }

  for (const dish of Array.isArray(seed.dishes) ? seed.dishes : []) {
    if (normalizeString(dish.integrity_note)) {
      notes.push({ scope: 'dish', id: normalizeString(dish.id), note: dish.integrity_note })
    }
  }

  for (const section of Array.isArray(seed.sections) ? seed.sections : []) {
    if (normalizeString(section.integrity_note)) {
      notes.push({ scope: 'section', id: normalizeString(section.id), note: section.integrity_note })
    }

    const items = Array.isArray(section.items) ? section.items : []
    for (const item of items) {
      if (normalizeString(item.integrity_note)) {
        notes.push({
          scope: 'menu-item',
          id: `${normalizeString(section.id)}/${normalizeString(item.id)}`,
          note: item.integrity_note,
        })
      }
    }
  }

  return notes
}

function validateSeed(seed) {
  const errors = []
  const warnings = []
  const ingredients = Array.isArray(seed.ingredients) ? seed.ingredients : []
  const recipes = Array.isArray(seed.recipes) ? seed.recipes : []
  const mise = Array.isArray(seed.mise) ? seed.mise : []
  const dishes = Array.isArray(seed.dishes) ? seed.dishes : []
  const sections = Array.isArray(seed.sections) ? seed.sections : []
  const ingredientIds = new Set(ingredients.map((entry) => normalizeString(entry.id)).filter(Boolean))
  const recipeIds = new Set(recipes.map((entry) => normalizeString(entry.id)).filter(Boolean))
  const miseIds = new Set(mise.map((entry) => normalizeString(entry.id)).filter(Boolean))
  const dishIds = new Set(dishes.map((entry) => normalizeString(entry.id)).filter(Boolean))

  if (!normalizeString(seed.kitchen?.id)) errors.push('missing kitchen.id')
  if (!normalizeString(seed.kitchen?.name)) errors.push('missing kitchen.name')
  if (!normalizeString(seed.kitchen?.slug)) errors.push('missing kitchen.slug')
  if (!normalizeString(seed.menu?.id)) errors.push('missing menu.id')

  errors.push(...duplicateIds(ingredients, 'ingredient duplicate'))
  errors.push(...duplicateIds(recipes, 'recipe duplicate'))
  errors.push(...duplicateIds(mise, 'mise duplicate'))
  errors.push(...duplicateIds(dishes, 'dish duplicate'))
  errors.push(...duplicateIds(sections, 'section duplicate'))

  for (const dish of dishes) {
    const dishId = normalizeString(dish.id)
    for (const recipeId of normalizeIdList(dish.recipe_ids)) {
      if (!recipeIds.has(recipeId)) {
        errors.push(`dish ${dishId} references unknown recipe ${recipeId}`)
      }
    }

    for (const miseId of normalizeIdList(dish.mise_ids)) {
      if (!miseIds.has(miseId)) {
        errors.push(`dish ${dishId} references unknown mise ${miseId}`)
      }
    }

    for (const ingredientId of normalizeIdList(dish.ingredient_ids)) {
      if (!ingredientIds.has(ingredientId)) {
        errors.push(`dish ${dishId} references unknown ingredient ${ingredientId}`)
      }
    }
  }

  const emptySections = []
  for (const section of sections) {
    const sectionId = normalizeString(section.id)
    const items = Array.isArray(section.items) ? section.items : []
    const itemDuplicates = duplicateIds(items, `section ${sectionId} item duplicate`)
    errors.push(...itemDuplicates)

    if (!items.length) emptySections.push(sectionId)
    for (const item of items) {
      const dishId = normalizeString(item.dish_id)
      if (!dishIds.has(dishId)) {
        errors.push(`section ${sectionId} references unknown dish ${dishId || '(empty)'}`)
      }
    }
  }

  if (emptySections.length) {
    warnings.push(`empty sections: ${emptySections.join(', ')}`)
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    emptySections,
    integrityNotes: collectIntegrityNotes(seed),
  }
}

const createdStamp = (snap) => {
  const existing = snap?.exists ? snap.get('created') : null
  return existing || {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

const updatedStamp = () => ({
  at: FieldValue.serverTimestamp(),
  by: SYSTEM_ACTOR,
})

function sourceLanguage(seed) {
  return normalizeString(seed.source_language) || 'en'
}

function localizedText(value, language, fallback) {
  const text = value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value)
          .map(([code, copy]) => [normalizeString(code).replace(/_/g, '-'), normalizeString(copy)])
          .filter(([code, copy]) => code && copy)
      )
    : {}

  if (!text[language] && normalizeString(fallback)) {
    text[language] = normalizeString(fallback)
  }

  return text
}

function buildIngredientPayload(ingredient, seed) {
  const language = sourceLanguage(seed)
  const names = localizedText(ingredient.names, language, ingredient.name)
  return {
    id: ingredient.id,
    name: ingredient.name,
    source_language: language,
    names,
    slug: ingredient.id,
    image_url: '',
    app_id: APP_ID,
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
      app_id: APP_ID,
    },
    updated: updatedStamp(),
  }
}

function buildRecipePayload(recipe, seed, kitchenId, snap) {
  const language = sourceLanguage(seed)
  const description = normalizeString(recipe.description)
  const names = localizedText(recipe.names, language, recipe.name)
  const descriptions = localizedText(recipe.descriptions, language, description)

  return {
    id: recipe.id,
    name: recipe.name,
    slug: recipe.id,
    description,
    source_language: language,
    names,
    descriptions,
    kitchen_id: kitchenId,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function buildMisePayload(mise, seed, kitchenId, snap) {
  const language = sourceLanguage(seed)
  const description = normalizeString(mise.description)
  const names = localizedText(mise.names, language, mise.name)
  const descriptions = localizedText(mise.descriptions, language, description)

  return {
    id: mise.id,
    kitchen_id: kitchenId,
    title: mise.name,
    name: mise.name,
    slug: mise.id,
    description,
    source_language: language,
    names,
    descriptions,
    kind: 'prep',
    type: 'prep',
    category: 'prep',
    station: normalizeString(mise.station),
    service_date: '',
    status: 'todo',
    priority: 'normal',
    estimated_minutes: 0,
    ingredient_ids: normalizeIdList(mise.ingredient_ids),
    mise_ids: normalizeIdList(mise.mise_ids),
    menu_id: '',
    recipe_id: normalizeString(mise.recipe_id),
    assignee_ids: [],
    checklist: [],
    due_at: {},
    completed_at: {},
    notes: normalizeString(mise.notes),
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function buildDishPayload(dish, seed, kitchenId, snap) {
  const language = sourceLanguage(seed)
  const description = normalizeString(dish.description)
  const payload = {
    id: dish.id,
    name: dish.name,
    slug: dish.id,
    description,
    source_language: language,
    names: {
      [language]: dish.name,
    },
    descriptions: description ? { [language]: description } : {},
    recipe_ids: normalizeIdList(dish.recipe_ids),
    mise_ids: normalizeIdList(dish.mise_ids),
    ingredient_ids: normalizeIdList(dish.ingredient_ids),
    kitchen_id: kitchenId,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }

  if (normalizeString(dish.integrity_note)) {
    payload.integrity_note = normalizeString(dish.integrity_note)
  }

  return payload
}

function buildMenuPayload(seed, kitchenId, snap) {
  return {
    id: seed.menu.id,
    kitchen_id: kitchenId,
    name: seed.menu.name,
    description: normalizeString(seed.menu.description),
    active: seed.menu.active === true,
    defaults: {
      active: true,
      description: '',
      photo_url: '',
    },
    service_modes: Array.isArray(seed.menu.service_modes) ? seed.menu.service_modes : [],
    ingredient_ids: (Array.isArray(seed.ingredients) ? seed.ingredients : []).map((ingredient) => ingredient.id),
    recipe_ids: (Array.isArray(seed.recipes) ? seed.recipes : []).map((recipe) => recipe.id),
    mise_ids: (Array.isArray(seed.mise) ? seed.mise : []).map((mise) => mise.id),
    dish_ids: (Array.isArray(seed.dishes) ? seed.dishes : []).map((dish) => dish.id),
    sections: seed.sections.map((section, index) => {
      const payload = {
        id: section.id,
        label: section.label,
        description: normalizeString(section.description),
        sort_order: Number(section.sort_order || (index + 1) * 10),
        items: (Array.isArray(section.items) ? section.items : []).map((item, itemIndex) => ({
          id: item.id,
          dish_id: item.dish_id,
          sort_order: Number(item.sort_order || (itemIndex + 1) * 10),
          ...(normalizeString(item.integrity_note)
            ? { integrity_note: normalizeString(item.integrity_note) }
            : {}),
        })),
      }

      const excludedIds = normalizeIdList(section.render_excluded_ids)
      const excludedTerms = normalizeIdList(section.render_excluded_terms)
      if (excludedIds.length) payload.render_excluded_ids = excludedIds
      if (excludedTerms.length) payload.render_excluded_terms = excludedTerms
      if (normalizeString(section.integrity_note)) {
        payload.integrity_note = normalizeString(section.integrity_note)
      }

      return payload
    }),
    sort_order: Number(seed.menu.sort_order || 0),
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

function buildKitchenIdentityPatch(seed) {
  return {
    id: seed.kitchen.id,
    name: seed.kitchen.name,
    slug: seed.kitchen.slug,
    updated: updatedStamp(),
  }
}

function buildKitchenIngredientPayload(ingredient, snap) {
  return {
    id: ingredient.id,
    ingredient_id: ingredient.id,
    created: createdStamp(snap),
    updated: updatedStamp(),
  }
}

async function inspectFirestoreState({ db, kitchenRef, seed }) {
  const ingredients = []
  const kitchenIngredients = []
  const recipes = []
  const mise = []
  const dishes = []

  for (const ingredient of seed.ingredients) {
    const snap = await db.collection('ingredients').doc(ingredient.id).get()
    ingredients.push({ id: ingredient.id, exists: snap.exists, path: snap.ref.path, snap })

    const kitchenSnap = await kitchenRef.collection('ingredients').doc(ingredient.id).get()
    kitchenIngredients.push({
      id: ingredient.id,
      exists: kitchenSnap.exists,
      path: kitchenSnap.ref.path,
      snap: kitchenSnap,
    })
  }

  for (const recipe of seed.recipes) {
    const snap = await kitchenRef.collection('recipes').doc(recipe.id).get()
    recipes.push({ id: recipe.id, exists: snap.exists, path: snap.ref.path, snap })
  }

  for (const item of Array.isArray(seed.mise) ? seed.mise : []) {
    const snap = await kitchenRef.collection('mise').doc(item.id).get()
    mise.push({ id: item.id, exists: snap.exists, path: snap.ref.path, snap })
  }

  for (const dish of seed.dishes) {
    const snap = await kitchenRef.collection('dishes').doc(dish.id).get()
    dishes.push({ id: dish.id, exists: snap.exists, path: snap.ref.path, snap })
  }

  const menuSnap = await kitchenRef.collection('menus').doc(seed.menu.id).get()

  return {
    ingredients,
    kitchenIngredients,
    recipes,
    mise,
    dishes,
    menu: { id: seed.menu.id, exists: menuSnap.exists, path: menuSnap.ref.path, snap: menuSnap },
    missingIngredients: ingredients.filter((entry) => !entry.exists).map((entry) => entry.id),
    missingKitchenIngredients: kitchenIngredients
      .filter((entry) => !entry.exists)
      .map((entry) => entry.id),
    missingRecipes: recipes.filter((entry) => !entry.exists).map((entry) => entry.id),
    missingMise: mise.filter((entry) => !entry.exists).map((entry) => entry.id),
    missingDishes: dishes.filter((entry) => !entry.exists).map((entry) => entry.id),
    missingMenu: !menuSnap.exists ? seed.menu.id : '',
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const commit = Boolean(args.commit)
  const seedPath =
    typeof args.seed === 'string' ? normalizeString(args.seed) : DEFAULT_SEED_PATH
  const { seed, resolvedPath: resolvedSeedPath } = await readSeed(seedPath)
  const validation = validateSeed(seed)
  if (!validation.ok) {
    console.error('[seed] luna-menu-prototype source invalid', validation)
    throw new Error('Luna menu seed failed integrity validation')
  }

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH

  if (!projectId) throw new Error('Project id is required')
  if (!kitchenCollectionPath) throw new Error('Kitchen collection path is required')

  const app = initializeApp({
    credential: cert(account),
    projectId,
  }, 'seed-luna-menu-prototype')
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${seed.kitchen.id}`)
  const menuRef = kitchenRef.collection('menus').doc(seed.menu.id)

  console.log('[seed] luna-menu-prototype start', {
    commit,
    projectId,
    databaseId: databaseId || '(default)',
    seed: resolvedSeedPath,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    validation: {
      warnings: validation.warnings,
      integrityNotes: validation.integrityNotes,
    },
  })

  const state = await inspectFirestoreState({ db, kitchenRef, seed })
  console.log('[seed] luna-menu-prototype firestore-check', {
    missingIngredients: state.missingIngredients,
    missingKitchenIngredients: state.missingKitchenIngredients,
    missingRecipes: state.missingRecipes,
    missingMise: state.missingMise,
    missingDishes: state.missingDishes,
    missingMenu: state.missingMenu || null,
    emptySections: validation.emptySections,
    unknownIds: [],
    duplicateIds: [],
  })

  const created = {
    ingredients: [],
    kitchenIngredients: [],
    recipes: [],
    mise: [],
    dishes: [],
    menus: [],
  }
  const updated = {
    kitchenIngredients: [],
    recipes: [],
    mise: [],
    dishes: [],
    menus: [],
  }
  const skipped = {
    ingredients: [],
  }

  if (commit) {
    const batch = db.batch()
    batch.set(kitchenRef, buildKitchenIdentityPatch(seed), { merge: true })

    for (const entry of state.ingredients) {
      const ingredient = seed.ingredients.find((item) => item.id === entry.id)
      if (!ingredient) continue
      if (entry.exists) {
        skipped.ingredients.push(entry.id)
        continue
      }

      batch.set(entry.snap.ref, buildIngredientPayload(ingredient, seed))
      created.ingredients.push(entry.id)
    }

    for (const entry of state.kitchenIngredients) {
      const ingredient = seed.ingredients.find((item) => item.id === entry.id)
      if (!ingredient) continue
      batch.set(entry.snap.ref, buildKitchenIngredientPayload(ingredient, entry.snap), {
        merge: false,
      })
      if (entry.exists) updated.kitchenIngredients.push(entry.id)
      else created.kitchenIngredients.push(entry.id)
    }

    for (const entry of state.recipes) {
      const recipe = seed.recipes.find((item) => item.id === entry.id)
      if (!recipe) continue
      batch.set(entry.snap.ref, buildRecipePayload(recipe, seed, seed.kitchen.id, entry.snap), {
        merge: false,
      })
      if (entry.exists) updated.recipes.push(entry.id)
      else created.recipes.push(entry.id)
    }

    for (const entry of state.mise) {
      const item = seed.mise.find((source) => source.id === entry.id)
      if (!item) continue
      batch.set(entry.snap.ref, buildMisePayload(item, seed, seed.kitchen.id, entry.snap), {
        merge: false,
      })
      if (entry.exists) updated.mise.push(entry.id)
      else created.mise.push(entry.id)
    }

    for (const entry of state.dishes) {
      const dish = seed.dishes.find((item) => item.id === entry.id)
      if (!dish) continue
      batch.set(entry.snap.ref, buildDishPayload(dish, seed, seed.kitchen.id, entry.snap), {
        merge: false,
      })
      if (entry.exists) updated.dishes.push(entry.id)
      else created.dishes.push(entry.id)
    }

    batch.set(menuRef, buildMenuPayload(seed, seed.kitchen.id, state.menu.snap), { merge: false })
    if (state.menu.exists) updated.menus.push(seed.menu.id)
    else created.menus.push(seed.menu.id)

    await batch.commit()
  } else {
    console.log('[dry-run] would write', {
      kitchen: kitchenRef.path,
      ingredients: state.ingredients.map((entry) => entry.path),
      kitchenIngredients: state.kitchenIngredients.map((entry) => entry.path),
      recipes: state.recipes.map((entry) => entry.path),
      mise: state.mise.map((entry) => entry.path),
      dishes: state.dishes.map((entry) => entry.path),
      menu: menuRef.path,
    })
  }

  console.log('[seed] luna-menu-prototype done', {
    commit,
    source: resolvedSeedPath,
    kitchenIdentity: {
      path: kitchenRef.path,
      name: seed.kitchen.name,
      slug: seed.kitchen.slug,
    },
    paths: {
      ingredients: 'ingredients',
      kitchenIngredients: kitchenRef.collection('ingredients').path,
      recipes: kitchenRef.collection('recipes').path,
      mise: kitchenRef.collection('mise').path,
      dishes: kitchenRef.collection('dishes').path,
      menu: menuRef.path,
    },
    created,
    updated,
    skipped,
    emptySections: validation.emptySections,
    integrityNotes: validation.integrityNotes,
  })
}

main().catch((error) => {
  console.error('[seed] luna-menu-prototype failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
