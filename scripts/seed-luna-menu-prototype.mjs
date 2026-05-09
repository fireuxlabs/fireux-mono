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
const MENU_ID = 'luna-semantic-menu'
const SYSTEM_ACTOR = 'system:seed-luna-menu-prototype'
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

function printHelp() {
  console.log(`
Seed Luna Piccante public semantic menu prototype.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-luna-menu-prototype.mjs [--commit]

Options:
  --commit                         Write the prototype menu doc.
  --project <id>                   Google/Firebase project id. Defaults to service-account project or misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen <id>                   Kitchen doc id. Defaults to Luna Piccante.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function buildMenuPayload(kitchenId) {
  return {
    id: MENU_ID,
    kitchen_id: kitchenId,
    name: 'Luna Piccante Menu',
    description: '',
    active: true,
    defaults: {
      active: true,
      description: '',
      photo_url: '',
    },
    service_modes: ['dine_in'],
    sections: [
      {
        id: 'pizza',
        label: 'Pizza',
        description: '',
        sort_order: 10,
        render_excluded_ids: ['pizza-dough'],
        items: [
          {
            id: 'margherita',
            dish_id: 'margherita',
            sort_order: 10,
          },
        ],
      },
    ],
    sort_order: 0,
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
  }, 'seed-luna-menu-prototype')
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchenRef = db.doc(`${kitchenCollectionPath}/${kitchenId}`)
  const menusCollection = kitchenRef.collection('menus')
  const dishesCollection = kitchenRef.collection('dishes')
  const menuRef = menusCollection.doc(MENU_ID)
  const margheritaRef = dishesCollection.doc('margherita')

  console.log('[seed] luna-menu-prototype start', {
    commit,
    projectId,
    databaseId: databaseId || '(default)',
    serviceAccount: resolvedPath,
    kitchenPath: kitchenRef.path,
    menusPath: menusCollection.path,
    menuPath: menuRef.path,
  })

  const kitchenSnap = await kitchenRef.get()
  if (!kitchenSnap.exists) {
    throw new Error(`Kitchen not found: ${kitchenRef.path}`)
  }

  const dishSnap = await margheritaRef.get()
  if (!dishSnap.exists) {
    throw new Error(`Dish not found: ${margheritaRef.path}`)
  }

  console.log('[seed] luna-menu-prototype kitchen', {
    id: kitchenSnap.id,
    name: normalizeString(kitchenSnap.get('name')),
    slug: normalizeString(kitchenSnap.get('slug')),
  })

  const menuSnap = await menuRef.get()
  if (menuSnap.exists) {
    console.log('[seed] luna-menu-prototype done', {
      commit,
      created: [],
      skipped: [MENU_ID],
      menuPath: menuRef.path,
    })
    return
  }

  if (commit) {
    await menuRef.set(buildMenuPayload(kitchenId))
  } else {
    console.log('[dry-run] create', {
      path: menuRef.path,
      section: 'pizza',
      dish_ids: ['margherita'],
      render_excluded_ids: ['pizza-dough'],
    })
  }

  console.log('[seed] luna-menu-prototype done', {
    commit,
    created: [MENU_ID],
    skipped: [],
    menuPath: menuRef.path,
  })
}

main().catch((error) => {
  console.error('[seed] luna-menu-prototype failed')
  console.error(error?.message || error)
  process.exitCode = 1
})
