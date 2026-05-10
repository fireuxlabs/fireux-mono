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
const DEFAULT_SEED_PATH = 'scripts/data/luna-piccante.recipes.seed.json'
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const SYSTEM_ACTOR = 'system:seed-luna-recipes'
const APP_ID = 'misebox-app'

const normalizeString = (value) => String(value ?? '').trim()

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
Seed Luna Piccante recipe/prep docs.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-recipes.mjs [--commit]

Options:
  --commit                         Write missing recipe docs.
  --seed <path>                    Seed JSON path. Defaults to scripts/data/luna-piccante.menu.seed.json.
  --project <id>                   Google/Firebase project id. Defaults to service-account project or misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen <id>                   Kitchen doc id. Defaults to Luna Piccante.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

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

function buildRecipePayload(recipe, kitchenId, language) {
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
  const recipes = Array.isArray(seed.recipes) ? seed.recipes : []
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

  if (!projectId) throw new Error('Project id is required')
  if (!kitchenId) throw new Error('Kitchen id is required')
  if (!kitchenCollectionPath) throw new Error('Kitchen collection path is required')

  const app = initializeApp({
    credential: cert(account),
    projectId,
  }, 'seed-luna-recipes')
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${kitchenId}`)
  const recipesCollection = kitchenRef.collection('recipes')

  console.log('[seed] luna-recipes start', {
    commit,
    projectId,
    databaseId: databaseId || '(default)',
    seed: resolvedSeedPath,
    serviceAccount: resolvedPath,
    kitchenPath: kitchenRef.path,
    recipesPath: recipesCollection.path,
  })

  const kitchenSnap = await kitchenRef.get()
  if (!kitchenSnap.exists) {
    throw new Error(`Kitchen not found: ${kitchenRef.path}`)
  }

  console.log('[seed] luna-recipes kitchen', {
    id: kitchenSnap.id,
    name: normalizeString(kitchenSnap.get('name')),
    slug: normalizeString(kitchenSnap.get('slug')),
  })

  const created = []
  const skipped = []
  const batch = db.batch()

  for (const recipe of recipes) {
    const ref = recipesCollection.doc(recipe.id)
    const snap = await ref.get()

    if (snap.exists) {
      skipped.push({ id: recipe.id, path: ref.path })
      continue
    }

    created.push({ id: recipe.id, path: ref.path })
    if (commit) {
      batch.set(ref, buildRecipePayload(recipe, kitchenId, language))
    } else {
      console.log('[dry-run] create', {
        path: ref.path,
        name: recipe.name,
        source_language: language,
      })
    }
  }

  if (commit && created.length > 0) {
    await batch.commit()
  }

  console.log('[seed] luna-recipes done', {
    commit,
    kitchenPath: kitchenRef.path,
    recipesPath: recipesCollection.path,
    created: created.map((entry) => entry.id),
    skipped: skipped.map((entry) => entry.id),
  })
}

main().catch((error) => {
  console.error('[seed] luna-recipes failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
