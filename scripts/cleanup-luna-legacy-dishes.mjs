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
const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const MENU_IDS = ['main', 'pizza']
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:cleanup-luna-legacy-dishes'

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
Clean Luna legacy/prototype dish docs.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/cleanup-luna-legacy-dishes.mjs [--commit]

Options:
  --commit                         Delete unreferenced dishes and rewrite kept dishes.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function certifiedLanguageMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    ['de', 'en']
      .map((language) => [language, normalizeString(value[language])])
      .filter(([, text]) => text)
  )
}

function cleanDishPayload(dish, dishRef) {
  const id = normalizeString(dish.id) || dishRef.id
  const name = normalizeString(dish.name)
  const description = normalizeString(dish.description)

  return {
    id,
    kitchen_id: normalizeString(dish.kitchen_id) || LUNA_KITCHEN_ID,
    name,
    slug: normalizeString(dish.slug) || id,
    description,
    names: certifiedLanguageMap(dish.names),
    descriptions: certifiedLanguageMap(dish.descriptions),
    created: dish.created || updatedStamp(),
    updated: updatedStamp(),
  }
}

function collectReferencedDishIds(menuDocs) {
  const ids = new Set()

  menuDocs.forEach((menuDoc) => {
    const menu = menuDoc.data() || {}
    const sections = Array.isArray(menu.sections) ? menu.sections : []

    sections.forEach((section) => {
      const items = Array.isArray(section?.items) ? section.items : []

      items.forEach((item) => {
        const dishId = normalizeString(item?.dish_id)
        if (dishId) ids.add(dishId)
      })
    })
  })

  return ids
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
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
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)

  const app = initializeApp(
    { credential: cert(account), projectId },
    'cleanup-luna-legacy-dishes'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${LUNA_KITCHEN_ID}`)
  const menuRefs = MENU_IDS.map((menuId) => kitchenRef.collection('menus').doc(menuId))
  const menuDocs = await Promise.all(menuRefs.map((ref) => ref.get()))
  const missingMenus = menuDocs
    .map((snap, index) => (snap.exists ? '' : MENU_IDS[index]))
    .filter(Boolean)

  if (missingMenus.length) {
    throw new Error(`Missing Luna menu docs: ${missingMenus.join(', ')}`)
  }

  const referencedDishIds = collectReferencedDishIds(menuDocs)
  const dishesSnap = await kitchenRef.collection('dishes').get()
  const deletedIds = []
  const cleanedIds = []
  const missingReferencedIds = []

  const dishRefsById = new Map(dishesSnap.docs.map((snap) => [snap.id, snap.ref]))
  referencedDishIds.forEach((dishId) => {
    if (!dishRefsById.has(dishId)) missingReferencedIds.push(dishId)
  })

  let batch = null
  let batchOperations = 0
  const commitBatch = async () => {
    if (!batch || batchOperations === 0) return
    await batch.commit()
    batch = null
    batchOperations = 0
  }
  const queue = async (operation) => {
    if (!commit) return
    if (!batch) batch = db.batch()
    operation(batch)
    batchOperations += 1
    if (batchOperations >= 450) await commitBatch()
  }

  for (const snap of dishesSnap.docs) {
    if (!referencedDishIds.has(snap.id)) {
      deletedIds.push(snap.id)
      await queue((activeBatch) => activeBatch.delete(snap.ref))
      continue
    }

    cleanedIds.push(snap.id)
    await queue((activeBatch) =>
      activeBatch.set(snap.ref, cleanDishPayload(snap.data() || {}, snap.ref), {
        merge: false,
      })
    )
  }

  await commitBatch()

  const summary = {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    referencedCount: referencedDishIds.size,
    existingDishCount: dishesSnap.size,
    keptCleanedCount: cleanedIds.length,
    deletedCount: deletedIds.length,
    missingReferencedCount: missingReferencedIds.length,
    deletedIds: deletedIds.sort((a, b) => a.localeCompare(b)),
    cleanedIds: cleanedIds.sort((a, b) => a.localeCompare(b)),
    missingReferencedIds: missingReferencedIds.sort((a, b) => a.localeCompare(b)),
    keptShape: [
      'id',
      'kitchen_id',
      'name',
      'slug',
      'description',
      'names.{de,en}',
      'descriptions.{de,en}',
      'created',
      'updated',
    ],
  }

  console.log(
    `[cleanup] luna-legacy-dishes ${commit ? 'committed' : 'dry-run'}`
  )
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error('[cleanup] luna-legacy-dishes failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
