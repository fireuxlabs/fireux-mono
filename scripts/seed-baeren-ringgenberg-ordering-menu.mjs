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
const DEFAULT_SEED_PATH = 'scripts/data/baeren-ringgenberg.ordering-menu.seed.json'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-baeren-ringgenberg-ordering-menu'
const CONSOLE_USER_ID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'

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

  return candidates.find((candidate) => existsSync(candidate)) || candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) throw new Error(`${label} file not found: ${pathValue}`)
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
Seed Hotel Bären Ringgenberg ordering menu.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-baeren-ringgenberg-ordering-menu.mjs [--commit] [--reset]

Options:
  --commit                         Write Firestore docs.
  --reset                          Delete Bären menus/dishes/cache before reseeding.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --seed <path>                    Seed JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
  --console-user <uid>             UID to add to the app kitchen overlay team_ids.
`)
}

function logSeed(label, payload) {
  console.log(label, JSON.stringify(payload, null, 2))
}

function stamp(snap) {
  if (snap?.exists && snap.data()?.created) return snap.data().created
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildDishPayload(item, kitchenId, snap) {
  return {
    id: item.id,
    kitchen_id: kitchenId,
    name: item.name,
    slug: item.id,
    description: normalizeString(item.description),
    names: { de: item.name },
    descriptions: { de: normalizeString(item.description) },
    ...(Array.isArray(item.dietary_tags) ? { dietary_tags: item.dietary_tags } : {}),
    created: stamp(snap),
    updated: updatedStamp(),
  }
}

function productIdForItem(kitchenSlug, item) {
  return `${kitchenSlug}-${item.id}`
}

function priceMinor(value) {
  return Math.round(Number(value || 0) * 100)
}

function buildProductPayload(seed, item, kitchenId, snap) {
  const productId = productIdForItem(seed.kitchen.slug, item)
  return {
    id: productId,
    source_app_id: APP_ID,
    owner_type: 'kitchen',
    owner_id: kitchenId,
    visibility: 'public',
    name: item.name,
    slug: productId,
    active: true,
    description: normalizeString(item.description),
    product_type: 'drink',
    default_price: {
      id: 'default',
      unit_amount: priceMinor(item.price),
    },
    metadata: {
      kitchen_id: kitchenId,
      menu_id: seed.menu.id,
      source: seed.source,
    },
    created: stamp(snap),
    updated: updatedStamp(),
  }
}

function buildProductPricePayload(productId, item, snap) {
  return {
    id: 'default',
    product_id: productId,
    label: item.name,
    currency: 'chf',
    unit_amount: priceMinor(item.price),
    type: 'one_time',
    billing_scheme: 'per_unit',
    active: true,
    default: true,
    provider: 'manual',
    provider_price_id: '',
    metadata: {},
    created: stamp(snap),
    updated: updatedStamp(),
  }
}

function buildMenuPayload(seed, kitchenId, snap) {
  const menu = seed.menu
  return {
    id: menu.id,
    kitchen_id: kitchenId,
    name: menu.name,
    description: menu.description,
    source_language: menu.source_language || seed.kitchen.primary_language || 'de',
    ordering: menu.ordering || {
      enabled: false,
      modes: [],
    },
    status: 'published',
    public_views: Array.isArray(menu.public_views) ? menu.public_views : [],
    source: seed.source,
    source_promotions: menu.promotions || [],
    created: stamp(snap),
    updated: updatedStamp(),
  }
}

function sectionOrderableType(section) {
  return normalizeString(section.orderable_type) || 'dish'
}

function writeMenuStructure(batch, menuRef, seed, kitchenId) {
  const menu = seed.menu
  menu.sections.forEach((section, sectionIndex) => {
    const sectionRef = menuRef.collection('sections').doc(section.id)
    batch.set(sectionRef, {
      id: section.id,
      kitchen_id: kitchenId,
      menu_id: menu.id,
      label: section.label,
      description: normalizeString(section.description),
      orderable_type: sectionOrderableType(section),
      status: 'active',
      sort_order: sectionIndex + 1,
      created: stamp(),
      updated: updatedStamp(),
    })

    section.items.forEach((item, itemIndex) => {
      const orderableType = normalizeString(item.orderable_type) || sectionOrderableType(section)
      const itemId = `${section.id}-${String(itemIndex + 1).padStart(2, '0')}`
      batch.set(sectionRef.collection('items').doc(`${section.id}-${String(itemIndex + 1).padStart(2, '0')}`), {
        id: itemId,
        kitchen_id: kitchenId,
        menu_id: menu.id,
        section_id: section.id,
        item_type: orderableType,
        dish_id: orderableType === 'dish' ? item.id : '',
        ...(orderableType === 'product'
          ? { product_id: productIdForItem(seed.kitchen.slug, item) }
          : {}),
        price: Number(item.price || 0),
        status: 'active',
        sort_order: itemIndex + 1,
        created: stamp(),
        updated: updatedStamp(),
      })
    })
  })
}

async function deleteCollection(collectionRef, ops) {
  const snap = await collectionRef.get()
  for (const doc of snap.docs) {
    ops.push((batch) => batch.delete(doc.ref))
    for (const subcollection of await doc.ref.listCollections()) {
      await deleteCollection(subcollection, ops)
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

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const seedPath = normalizeString(args.seed || DEFAULT_SEED_PATH)
  const { data: seed, resolvedPath: resolvedSeedPath } = await readJsonFile(seedPath, 'Bären seed')
  const serviceAccountPath = normalizeString(
    args['service-account'] ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      DEFAULT_SERVICE_ACCOUNT_PATH
  )
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(args.project || account.project_id || DEFAULT_PROJECT_ID)
  const databaseId = typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath = normalizeString(args['kitchen-collection'] || DEFAULT_KITCHEN_COLLECTION_PATH)
  const consoleUserId = normalizeString(args['console-user'] || CONSOLE_USER_ID)
  const commit = Boolean(args.commit)
  const reset = Boolean(args.reset)

  const app = initializeApp(
    { credential: cert(account), projectId },
    `seed-baeren-ringgenberg-ordering-menu-${Date.now()}`
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', seed.kitchen.slug).limit(1).get()
  const kitchenRef = slugSnap.empty
    ? kitchensRef.doc(seed.kitchen.id)
    : slugSnap.docs[0].ref
  const kitchenId = kitchenRef.id
  const appKitchenRef = db.doc(`apps/${APP_ID}/kitchens/${kitchenId}`)
  const menuRef = kitchenRef.collection('menus').doc(seed.menu.id)
  const menuEntries = seed.menu.sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      orderable_type: normalizeString(item.orderable_type) ||
        normalizeString(section.orderable_type) ||
        'dish',
    }))
  )
  const dishEntries = menuEntries.filter((item) => item.orderable_type === 'dish')
  const productEntries = menuEntries.filter((item) => item.orderable_type === 'product')
  const [kitchenSnap, appKitchenSnap, existingMenusSnap, existingDishesSnap, menuSnap, ...entrySnaps] = await Promise.all([
    kitchenRef.get(),
    appKitchenRef.get(),
    kitchenRef.collection('menus').get(),
    kitchenRef.collection('dishes').get(),
    menuRef.get(),
    ...dishEntries.map((item) => kitchenRef.collection('dishes').doc(item.id).get()),
    ...productEntries.map((item) => db.collection('products').doc(productIdForItem(seed.kitchen.slug, item)).get()),
    ...productEntries.map((item) =>
      db
        .collection('products')
        .doc(productIdForItem(seed.kitchen.slug, item))
        .collection('prices')
        .doc('default')
        .get()
    ),
  ])
  const dishSnaps = entrySnaps.slice(0, dishEntries.length)
  const productSnaps = entrySnaps.slice(dishEntries.length, dishEntries.length + productEntries.length)
  const productPriceSnaps = entrySnaps.slice(dishEntries.length + productEntries.length)

  const deleteOps = []
  if (reset) {
    await deleteCollection(kitchenRef.collection('menus'), deleteOps)
    await deleteCollection(kitchenRef.collection('dishes'), deleteOps)
  }

  const writeOps = [
    (batch) => batch.set(kitchenRef, {
      ...seed.kitchen,
      id: kitchenId,
      active: true,
      updated: updatedStamp(),
      created: stamp(kitchenSnap),
    }, { merge: true }),
    (batch) => batch.set(appKitchenRef, {
      id: kitchenId,
      ...(consoleUserId ? { team_ids: FieldValue.arrayUnion(consoleUserId) } : {}),
      updated: updatedStamp(),
      created: stamp(appKitchenSnap),
    }, { merge: true }),
    (batch) => batch.set(menuRef, buildMenuPayload(seed, kitchenId, menuSnap), { merge: false }),
    (batch) => writeMenuStructure(batch, menuRef, seed, kitchenId),
    ...dishEntries.map((item, index) => (batch) =>
      batch.set(
        kitchenRef.collection('dishes').doc(item.id),
        buildDishPayload(item, kitchenId, dishSnaps[index]),
        { merge: false }
      )
    ),
    ...productEntries.map((item, index) => (batch) => {
      const productId = productIdForItem(seed.kitchen.slug, item)
      const productRef = db.collection('products').doc(productId)
      batch.set(
        productRef,
        buildProductPayload(seed, item, kitchenId, productSnaps[index]),
        { merge: true }
      )
      batch.set(
        productRef.collection('prices').doc('default'),
        buildProductPricePayload(productId, item, productPriceSnaps[index]),
        { merge: true }
      )
    }),
  ]

  logSeed('[seed] baeren-ringgenberg-ordering-menu start', {
    commit,
    reset,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    seed: resolvedSeedPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    appKitchenPath: appKitchenRef.path,
    kitchenId,
    kitchenIdSource: slugSnap.empty ? 'fallback-id' : 'existing-slug-match',
    sectionCount: seed.menu.sections.length,
    dishCount: dishEntries.length,
    productCount: productEntries.length,
    existing: {
      kitchen: kitchenSnap.exists,
      appKitchen: appKitchenSnap.exists,
      menus: existingMenusSnap.size,
      dishes: existingDishesSnap.size,
    },
    planned: {
      deleteOps: deleteOps.length,
      writeOps: writeOps.length,
      route: `/kitchens/${seed.kitchen.slug}/menus/${seed.menu.id}`,
    },
  })

  let deleted = 0
  let written = 0
  if (commit) {
    deleted = await commitOps(db, deleteOps)
    written = await commitOps(db, writeOps)
  }

  logSeed('[seed] baeren-ringgenberg-ordering-menu done', {
    commit,
    reset,
    deleted,
    written,
    routes: [
      `/kitchens/${seed.kitchen.slug}/menus`,
      `/kitchens/${seed.kitchen.slug}/menus/${seed.menu.id}`,
    ],
  })
}

main().catch((error) => {
  console.error('[seed] baeren-ringgenberg-ordering-menu failed')
  console.error(error)
  process.exit(1)
})
