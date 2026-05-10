#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const DEFAULT_MENU_SEED_PATH = 'scripts/data/luna-piccante.menu.seed.json'
const DEFAULT_RECIPE_SEED_PATH = 'scripts/data/luna-piccante.recipes.seed.json'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const SYSTEM_ACTOR = 'system:map-luna-dish-components'
const APP_ID = 'misebox-app'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeIdList = (value) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

const map = ({ recipe_ids = [], mise_ids = [], ingredient_ids = [], unmapped_terms = [], complete = false } = {}) => ({
  recipe_ids,
  mise_ids,
  ingredient_ids,
  unmapped_terms,
  complete,
})

const DISH_COMPONENT_MAPPINGS = {
  'focaccia-aperitivo-pomodoro-bufala-e-parma': map({
    recipe_ids: ['pizza-dough'],
    mise_ids: ['tomato-cubes'],
    ingredient_ids: ['garlic', 'onion', 'basil', 'buffalo-mozzarella', 'parma-ham'],
    unmapped_terms: ['olive oil'],
  }),
  'focaccia-prosciutto-di-parma': map({
    recipe_ids: ['pizza-dough'],
    ingredient_ids: ['parma-ham'],
    unmapped_terms: ['olive oil'],
  }),
  'carpaccio-di-manzo': map({
    unmapped_terms: ['beef carpaccio'],
  }),
  'gamberetti-all-aglio': map({
    ingredient_ids: ['shrimps', 'garlic'],
    complete: true,
  }),
  'cocktail-di-gamberetti': map({
    recipe_ids: ['cocktail-sauce'],
    ingredient_ids: ['shrimps'],
    complete: true,
  }),
  bruschetta: map({
    mise_ids: ['tomato-cubes', 'roasted-bread'],
    ingredient_ids: ['fresh-herbs', 'garlic', 'onion', 'basil'],
    unmapped_terms: ['olive oil'],
  }),
  minestrone: map({
    recipe_ids: ['vegetable-soup'],
    complete: true,
  }),
  'crema-di-pomodoro': map({
    recipe_ids: ['tomato-cream-soup'],
    complete: true,
  }),
  'insalata-soncino': map({
    unmapped_terms: ['soncino'],
  }),
  'insalata-caprese': map({
    ingredient_ids: ['buffalo-mozzarella', 'tomato', 'basil'],
    complete: true,
  }),
  burrata: map({
    unmapped_terms: ['burrata'],
  }),
  'insalata-gigante': map(),
  'insalata-verde': map({
    unmapped_terms: ['green salad'],
  }),
  'insalata-mista': map({
    ingredient_ids: ['vegetables'],
  }),
  'risotto-milanese': map({
    recipe_ids: ['saffron-risotto'],
    complete: true,
  }),
  'risotto-pollo-e-zafferano': map({
    recipe_ids: ['saffron-risotto'],
    ingredient_ids: ['chicken'],
    complete: true,
  }),
  'risotto-porcini': map({
    ingredient_ids: ['porcini'],
  }),
  'gnocchi-piemontese': map({
    unmapped_terms: ['gnocchi'],
  }),
  'lasagna-casalinga': map({
    unmapped_terms: ['lasagna'],
  }),
  'cannelloni-fiorentina': map({
    recipe_ids: ['spinach-curd-filling'],
  }),
  'fettuccine-nere-mare-e-monti': map({
    ingredient_ids: ['seafood', 'porcini'],
  }),
  'fettuccine-nere-al-salmone': map({
    ingredient_ids: ['salmon'],
    complete: true,
  }),
  'penne-all-arrabbiata': map({
    recipe_ids: ['tomato-sauce'],
    ingredient_ids: ['fresh-chili', 'garlic'],
  }),
  'spaghetti-aglio-olio-e-peperoncino': map({
    ingredient_ids: ['garlic', 'fresh-chili'],
    unmapped_terms: ['olive oil'],
  }),
  'spaghetti-frutti-di-mare': map({
    ingredient_ids: ['seafood'],
    complete: true,
  }),
  'spaghetti-carbonara': map({
    ingredient_ids: ['bacon', 'egg', 'grana-padano'],
  }),
  'spaghetti-vegetariana': map({
    ingredient_ids: ['vegetables'],
    complete: true,
  }),
  'spaghetti-napoli': map({
    recipe_ids: ['tomato-sauce'],
    complete: true,
  }),
  'spaghetti-al-pesto': map({
    recipe_ids: ['pesto-cream-sauce'],
  }),
  'spaghetti-bolognese': map({
    recipe_ids: ['beef-sauce'],
    complete: true,
  }),
  margherita: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['mozzarella', 'oregano'],
    complete: true,
  }),
  marinara: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['garlic', 'oregano'],
  }),
  napoli: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['anchovies', 'capers', 'oregano'],
  }),
  prosciutto: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['ham'],
  }),
  'prosciutto-e-funghi': map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['ham', 'mushrooms'],
  }),
  salami: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['salami'],
  }),
  piccante: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['spicy-salami', 'fresh-chili'],
  }),
  diavola: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['spicy-salami', 'fresh-chili'],
  }),
  hawaii: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['ham', 'pineapple'],
  }),
  tonno: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['tuna'],
  }),
  'tonno-e-cipolla': map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['tuna', 'onion'],
  }),
  gamberetti: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['shrimps'],
  }),
  'frutti-di-mare': map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['seafood'],
  }),
  salmone: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['salmon'],
  }),
  vegetariana: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['vegetables'],
  }),
  'quattro-formaggi': map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['mozzarella', 'gorgonzola', 'grana-padano'],
    unmapped_terms: ['fourth cheese'],
  }),
  'quattro-stagioni': map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['ham', 'mushrooms', 'artichokes', 'olives'],
  }),
  calzone: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['ham', 'mushrooms'],
  }),
  parma: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['parma-ham'],
  }),
  buffala: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['buffalo-mozzarella'],
  }),
  gorgonzola: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['gorgonzola'],
  }),
  boscaiolo: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['mushrooms', 'bacon'],
  }),
  melanzane: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['aubergine'],
  }),
  parmigiana: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['aubergine', 'grana-padano'],
  }),
  oliva: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['olives'],
  }),
  paprika: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['red-pepper', 'green-pepper'],
  }),
  tricolore: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['tomato', 'mozzarella', 'basil'],
  }),
  curry: map({
    recipe_ids: ['pizza-dough'],
    unmapped_terms: ['curry'],
  }),
  lucifer: map({
    recipe_ids: ['pizza-dough', 'tomato-sauce'],
    ingredient_ids: ['spicy-salami', 'fresh-chili'],
  }),
  'gamberoni-alla-griglia': map({
    ingredient_ids: ['shrimps'],
    complete: true,
  }),
  'gamberi-luna-piccante': map({
    ingredient_ids: ['shrimps', 'fresh-chili'],
  }),
  'salmone-alla-griglia': map({
    ingredient_ids: ['salmon'],
    complete: true,
  }),
  'controfiletto-di-manzo-al-pepe-verde': map({
    recipe_ids: ['green-pepper-sauce'],
    ingredient_ids: ['beef-strips'],
    complete: true,
  }),
  'controfiletto-d-agnello-alla-griglia': map({
    ingredient_ids: ['lamb-strips'],
  }),
  'petto-di-pollo-alla-griglia': map({
    ingredient_ids: ['chicken'],
    complete: true,
  }),
  'maiale-impanato': map({
    unmapped_terms: ['pork'],
  }),
  'scaloppina-di-vitello-al-limone': map({
    ingredient_ids: ['veal-strips'],
    unmapped_terms: ['lemon'],
  }),
  'saltimbocca-alla-romana': map({
    ingredient_ids: ['veal-strips', 'parma-ham'],
    unmapped_terms: ['sage'],
  }),
  'scaloppina-di-vitello-alla-crema-di-funghi': map({
    recipe_ids: ['mushroom-cream-sauce'],
    ingredient_ids: ['veal-strips'],
    complete: true,
  }),
  'lamm-nierstuck': map({
    ingredient_ids: ['lamb-strips'],
  }),
  'rindsfleisch-spiess': map({
    ingredient_ids: ['beef-cubes'],
  }),
  'gemischter-spiess': map({
    ingredient_ids: ['beef-cubes', 'lamb-strips', 'chicken'],
  }),
  'spaghetti-with-tomato-sauce': map({
    recipe_ids: ['tomato-sauce'],
    complete: true,
  }),
  'kids-spaghetti-bolognese': map({
    recipe_ids: ['beef-sauce'],
    complete: true,
  }),
  'kids-spaghetti-carbonara': map({
    ingredient_ids: ['bacon', 'egg', 'grana-padano'],
  }),
  'kids-spaghetti-al-pesto': map({
    recipe_ids: ['pesto-cream-sauce'],
  }),
  'chicken-nuggets': map({
    ingredient_ids: ['chicken'],
  }),
  'portion-pommes-frites': map({
    unmapped_terms: ['pommes frites'],
  }),
  'saffron-risotto': map({
    recipe_ids: ['saffron-risotto'],
    complete: true,
  }),
}

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

function printHelp() {
  console.log(`
Map Luna Piccante dish semantic components.

Dry-run by default. Pass --write-seed to update the seed JSON and --commit to write Firestore dish docs.

Usage:
  node scripts/map-luna-dish-components.mjs [--write-seed] [--commit]

Options:
  --write-seed                     Write mapped component arrays into the menu seed.
  --commit                         Write mapped component arrays to Firestore dish docs.
  --seed <path>                    Menu seed path. Defaults to scripts/data/luna-piccante.menu.seed.json.
  --recipe-seed <path>             Recipe seed path. Defaults to scripts/data/luna-piccante.recipes.seed.json.
  --project <id>                   Google/Firebase project id. Defaults to service-account project or misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen <id>                   Kitchen doc id. Defaults to Luna Piccante.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function validateMappedIds(seed) {
  const recipeIds = new Set(normalizeIdList(seed.recipes?.map((entry) => entry.id)))
  const miseIds = new Set(normalizeIdList(seed.mise?.map((entry) => entry.id)))
  const ingredientIds = new Set(normalizeIdList(seed.ingredients?.map((entry) => entry.id)))
  const missing = {
    recipes: [],
    mise: [],
    ingredients: [],
  }

  for (const dish of seed.dishes || []) {
    for (const id of normalizeIdList(dish.recipe_ids)) {
      if (!recipeIds.has(id)) missing.recipes.push(`${dish.id}:${id}`)
    }
    for (const id of normalizeIdList(dish.mise_ids)) {
      if (!miseIds.has(id)) missing.mise.push(`${dish.id}:${id}`)
    }
    for (const id of normalizeIdList(dish.ingredient_ids)) {
      if (!ingredientIds.has(id)) missing.ingredients.push(`${dish.id}:${id}`)
    }
  }

  return {
    recipes: Array.from(new Set(missing.recipes)),
    mise: Array.from(new Set(missing.mise)),
    ingredients: Array.from(new Set(missing.ingredients)),
  }
}

function applyMapping(seed, recipeSeed) {
  const next = structuredClone(seed)
  if (Array.isArray(recipeSeed.recipes) && recipeSeed.recipes.length) {
    next.recipes = recipeSeed.recipes
  }

  next.dishes = (Array.isArray(next.dishes) ? next.dishes : []).map((dish) => {
    const mapping = DISH_COMPONENT_MAPPINGS[dish.id] || map()
    const recipeIds = normalizeIdList(mapping.recipe_ids)
    const miseIds = normalizeIdList(mapping.mise_ids)
    const ingredientIds = normalizeIdList(mapping.ingredient_ids)
    const unmappedTerms = normalizeIdList(mapping.unmapped_terms)
    const hasComponents = recipeIds.length || miseIds.length || ingredientIds.length
    const isComplete = mapping.complete === true && unmappedTerms.length === 0
    const nextDish = {
      ...dish,
      recipe_ids: recipeIds,
      mise_ids: miseIds,
      ingredient_ids: ingredientIds,
    }

    if (unmappedTerms.length) {
      nextDish.unmapped_terms = unmappedTerms
    } else {
      delete nextDish.unmapped_terms
    }

    if (!hasComponents || !isComplete) {
      nextDish.integrity_note = 'component mapping pending'
    } else {
      delete nextDish.integrity_note
    }

    return nextDish
  })

  return next
}

function summarize(seed) {
  const dishes = Array.isArray(seed.dishes) ? seed.dishes : []
  const mapped = dishes.filter(
    (dish) =>
      normalizeIdList(dish.recipe_ids).length ||
      normalizeIdList(dish.mise_ids).length ||
      normalizeIdList(dish.ingredient_ids).length
  )
  const pending = dishes.filter((dish) => normalizeString(dish.integrity_note))
  const unmappedTerms = Array.from(
    new Set(dishes.flatMap((dish) => normalizeIdList(dish.unmapped_terms)))
  ).sort()

  return {
    dishCount: dishes.length,
    mappedDishCount: mapped.length,
    pendingDishCount: pending.length,
    unmappedTerms,
  }
}

function buildDishPatch(dish) {
  const patch = {
    recipe_ids: normalizeIdList(dish.recipe_ids),
    mise_ids: normalizeIdList(dish.mise_ids),
    ingredient_ids: normalizeIdList(dish.ingredient_ids),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
  }

  const integrityNote = normalizeString(dish.integrity_note)
  if (integrityNote) {
    patch.integrity_note = integrityNote
  } else {
    patch.integrity_note = FieldValue.delete()
  }

  const unmappedTerms = normalizeIdList(dish.unmapped_terms)
  if (unmappedTerms.length) {
    patch.unmapped_terms = unmappedTerms
  } else {
    patch.unmapped_terms = FieldValue.delete()
  }

  return patch
}

async function writeFirestore(seed, options) {
  const { account, resolvedPath } = await readServiceAccount(options.serviceAccountPath)
  const projectId = normalizeString(
    options.projectId || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const app = initializeApp(
    {
      credential: cert(account),
      projectId,
    },
    'map-luna-dish-components'
  )
  const db = options.databaseId ? getFirestore(app, options.databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${options.kitchenCollectionPath}/${options.kitchenId}`)
  const dishesCollection = kitchenRef.collection('dishes')
  const missingDocs = []
  const written = []
  let batch = db.batch()
  let batchSize = 0

  for (const dish of seed.dishes || []) {
    const ref = dishesCollection.doc(dish.id)
    const snap = await ref.get()
    if (!snap.exists) {
      missingDocs.push(dish.id)
      batch.set(ref, {
        id: dish.id,
        name: dish.name,
        slug: dish.slug || dish.id,
        description: normalizeString(dish.description),
        source_language: normalizeString(dish.source_language) || 'en',
        names: dish.names && typeof dish.names === 'object' ? dish.names : { en: dish.name },
        descriptions: dish.descriptions && typeof dish.descriptions === 'object' ? dish.descriptions : {},
        kitchen_id: options.kitchenId,
        created: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
          app_id: APP_ID,
        },
        ...buildDishPatch(dish),
      })
    } else {
      batch.update(ref, buildDishPatch(dish))
    }

    written.push(dish.id)
    batchSize += 1
    if (batchSize >= 450) {
      await batch.commit()
      batch = db.batch()
      batchSize = 0
    }
  }

  if (batchSize > 0) {
    await batch.commit()
  }

  return {
    projectId,
    serviceAccount: resolvedPath,
    kitchenPath: kitchenRef.path,
    dishesPath: dishesCollection.path,
    written,
    missingDocs,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const seedPath =
    typeof args.seed === 'string' ? normalizeString(args.seed) : DEFAULT_MENU_SEED_PATH
  const recipeSeedPath =
    typeof args['recipe-seed'] === 'string'
      ? normalizeString(args['recipe-seed'])
      : DEFAULT_RECIPE_SEED_PATH
  const { data: seed, resolvedPath: resolvedSeedPath } = await readJsonFile(
    seedPath,
    'Luna menu seed'
  )
  const { data: recipeSeed, resolvedPath: resolvedRecipeSeedPath } = await readJsonFile(
    recipeSeedPath,
    'Luna recipe seed'
  )
  const mappedSeed = applyMapping(seed, recipeSeed)
  const missing = validateMappedIds(mappedSeed)
  const summary = summarize(mappedSeed)

  if (missing.recipes.length || missing.mise.length || missing.ingredients.length) {
    console.error('[map] missing component ids', missing)
    throw new Error('Mapped seed references missing component ids')
  }

  if (args['write-seed']) {
    await writeFile(resolvedSeedPath, `${JSON.stringify(mappedSeed, null, 2)}\n`, 'utf8')
  }

  let firestore = null
  if (args.commit) {
    const serviceAccountPath =
      typeof args['service-account'] === 'string'
        ? normalizeString(args['service-account'])
        : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
    firestore = await writeFirestore(mappedSeed, {
      serviceAccountPath,
      projectId: args.project,
      databaseId:
        typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID,
      kitchenId:
        typeof args.kitchen === 'string' ? normalizeString(args.kitchen) : LUNA_KITCHEN_ID,
      kitchenCollectionPath:
        typeof args['kitchen-collection'] === 'string'
          ? normalizeString(args['kitchen-collection'])
          : DEFAULT_KITCHEN_COLLECTION_PATH,
    })
  }

  console.log('[map] luna-dish-components done', {
    writeSeed: Boolean(args['write-seed']),
    commit: Boolean(args.commit),
    seed: resolvedSeedPath,
    recipeSeed: resolvedRecipeSeedPath,
    ...summary,
    missing,
    firestore,
  })
}

main().catch((error) => {
  console.error('[map] luna-dish-components failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
