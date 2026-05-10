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
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const SYSTEM_ACTOR = 'system:seed-luna-dishes'
const APP_ID = 'misebox-app'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) => normalizeString(value).replace(/_/g, '-')
const normalizeComparable = (value) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

async function readServiceAccount(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const parsed = JSON.parse(await readFile(candidate, 'utf8'))
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error(`Invalid service account JSON: ${candidate}`)
    }
    return { account: parsed, resolvedPath: candidate }
  }

  throw new Error(`Service account file not found: ${pathValue}`)
}

async function readSeed(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    return {
      seed: JSON.parse(await readFile(candidate, 'utf8')),
      resolvedPath: candidate,
    }
  }

  throw new Error(`Seed file not found: ${pathValue}`)
}

function printHelp() {
  console.log(`
Seed Luna Piccante dish proof docs.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-dishes.mjs [--commit]

Options:
  --commit                         Write missing dish docs.
  --seed <path>                    Seed JSON path. Defaults to scripts/data/luna-piccante.menu.seed.json.
  --project <id>                   Google/Firebase project id. Defaults to service-account project or misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen <id>                   Kitchen doc id. Defaults to Luna Piccante.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
  --language <code>                Render proof language. Defaults to en.
`)
}

function sourceLanguage(seed) {
  return normalizeString(seed.source_language) || 'en'
}

function excludedIdsForDish(seed, dishId) {
  const sections = Array.isArray(seed.sections) ? seed.sections : []
  const excluded = []

  for (const section of sections) {
    const items = Array.isArray(section.items) ? section.items : []
    const hasDish = items.some((item) => normalizeString(item.dish_id) === dishId)
    if (!hasDish) continue
    excluded.push(...normalizeIdList(section.render_excluded_ids))
  }

  return Array.from(new Set(excluded))
}

function buildDishPayload(dish, kitchenId, language) {
  const description = normalizeString(dish.description)
  return {
    id: dish.id,
    name: dish.name,
    slug: dish.id,
    description,
    source_language: language,
    names: {
      [language]: dish.name,
    },
    descriptions: description
      ? {
          [language]: description,
        }
      : {},
    recipe_ids: dish.recipe_ids,
    ingredient_ids: dish.ingredient_ids,
    kitchen_id: kitchenId,
    created: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
      app_id: APP_ID,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }
}

function sourceName(source, languageCode) {
  const names = source?.names && typeof source.names === 'object' ? source.names : {}
  return normalizeString(names[languageCode]) || normalizeString(source?.name)
}

function resolveDishSemanticLine({ dish, recipes, ingredients, languageCode, excludedIds }) {
  const excluded = new Set(normalizeIdList(excludedIds))
  const excludedTerms = new Set(
    normalizeIdList(excludedIds).map((id) => normalizeComparable(id))
  )
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const ingredientsById = new Map(
    ingredients.map((ingredient) => [ingredient.id, ingredient])
  )
  const names = []

  const pushSource = (id, source) => {
    if (!source || excluded.has(id)) return
    const name = sourceName(source, languageCode)
    if (!name || excludedTerms.has(normalizeComparable(name))) return
    names.push(name)
  }

  normalizeIdList(dish.recipe_ids).forEach((id) => pushSource(id, recipesById.get(id)))
  normalizeIdList(dish.ingredient_ids).forEach((id) =>
    pushSource(id, ingredientsById.get(id))
  )

  return names.join(', ')
}

async function fetchSourceDocs(collectionRef, ids, kind) {
  const entries = []
  const missing = []

  for (const id of ids) {
    const snap = await collectionRef.doc(id).get()
    if (!snap.exists) {
      missing.push(id)
      continue
    }

    entries.push({ id: snap.id, ...(snap.data() || {}) })
  }

  if (missing.length) {
    throw new Error(`Missing ${kind}: ${missing.join(', ')}`)
  }

  return entries
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
  const dishes = Array.isArray(seed.dishes) ? seed.dishes : []
  const language = sourceLanguage(seed)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath } = await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DEFAULT_DATABASE_ID
  const kitchenId =
    typeof args.kitchen === 'string'
      ? normalizeString(args.kitchen)
      : LUNA_KITCHEN_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const languageCode =
    normalizeLanguageCode(args.language) || language

  if (!projectId) throw new Error('Project id is required')
  if (!kitchenId) throw new Error('Kitchen id is required')
  if (!kitchenCollectionPath) throw new Error('Kitchen collection path is required')

  const app = initializeApp({
    credential: cert(account),
    projectId,
  }, 'seed-luna-dishes')
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${kitchenId}`)
  const recipesCollection = kitchenRef.collection('recipes')
  const dishesCollection = kitchenRef.collection('dishes')
  const ingredientsCollection = db.collection('ingredients')

  console.log('[seed] luna-dishes start', {
    commit,
    projectId,
    databaseId: databaseId || '(default)',
    seed: resolvedSeedPath,
    serviceAccount: resolvedPath,
    kitchenPath: kitchenRef.path,
    dishesPath: dishesCollection.path,
  })

  const kitchenSnap = await kitchenRef.get()
  if (!kitchenSnap.exists) {
    throw new Error(`Kitchen not found: ${kitchenRef.path}`)
  }

  console.log('[seed] luna-dishes kitchen', {
    id: kitchenSnap.id,
    name: normalizeString(kitchenSnap.get('name')),
    slug: normalizeString(kitchenSnap.get('slug')),
  })

  const created = []
  const skipped = []
  const renderProofs = []
  const batch = db.batch()

  for (const dish of dishes) {
    const recipeIds = normalizeIdList(dish.recipe_ids)
    const ingredientIds = normalizeIdList(dish.ingredient_ids)
    const recipes = await fetchSourceDocs(recipesCollection, recipeIds, 'recipes')
    const ingredients = await fetchSourceDocs(
      ingredientsCollection,
      ingredientIds,
      'ingredients'
    )
    const ref = dishesCollection.doc(dish.id)
    const snap = await ref.get()
    const payload = buildDishPayload(dish, kitchenId, language)
    const resolvedDish = snap.exists ? { id: snap.id, ...(snap.data() || {}) } : payload

    if (snap.exists) {
      skipped.push({ id: dish.id, path: ref.path })
    } else {
      created.push({ id: dish.id, path: ref.path })
      if (commit) {
        batch.set(ref, payload)
      } else {
        console.log('[dry-run] create', {
          path: ref.path,
          name: dish.name,
          recipe_ids: recipeIds,
          ingredient_ids: ingredientIds,
        })
      }
    }

    const excludedIds = excludedIdsForDish(seed, dish.id)
    renderProofs.push({
      dishId: dish.id,
      language: languageCode,
      excludedIds,
      line: resolveDishSemanticLine({
        dish: resolvedDish,
        recipes,
        ingredients,
        languageCode,
        excludedIds,
      }),
    })
  }

  if (commit && created.length > 0) {
    await batch.commit()
  }

  renderProofs.forEach((proof) => {
    console.log('[seed] luna-dishes semantic-line', proof)
  })

  console.log('[seed] luna-dishes done', {
    commit,
    kitchenPath: kitchenRef.path,
    dishesPath: dishesCollection.path,
    created: created.map((entry) => entry.id),
    skipped: skipped.map((entry) => entry.id),
  })
}

main().catch((error) => {
  console.error('[seed] luna-dishes failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
