#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-14
// usage_note: plan or apply the protected replacement of three Friiites prototype Supplier chains with exact local Google-backed Suppliers.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'friiites'
const KITCHEN_ID = '5dGJgdjDv7Zi0tjva61O'
const ACTOR = 'system:migrate-friiites-local-suppliers'
const MANIFEST_PATH = fileURLToPath(new URL('./data/friiites-local-suppliers.json', import.meta.url))
const args = parseArgs(process.argv.slice(2))
const text = value => String(value ?? '').trim()

if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project ${PROJECT_ID} --database ${DATABASE_ID}.`)
}

const stableValue = value => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stableValue)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  if (typeof value.path === 'string' && value.firestore) return { __reference: value.path }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableValue(child)])
  )
}
const sha256 = value => createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex')
const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
if (
  manifest.format !== 'fireux-friiites-local-suppliers/1' ||
  manifest.target?.project_id !== PROJECT_ID ||
  manifest.target?.database_id !== DATABASE_ID ||
  manifest.target?.app_id !== APP_ID ||
  manifest.target?.kitchen_id !== KITCHEN_ID ||
  manifest.suppliers?.length !== 3
) {
  throw new Error('Friiites local Supplier manifest is invalid.')
}

const oldIds = manifest.suppliers.map(entry => text(entry.source_id))
const newIds = manifest.suppliers.map(entry => text(entry.id))
const placeIds = manifest.suppliers.map(entry => text(entry.place?.id))
if (
  [...oldIds, ...newIds, ...placeIds].some(id => !id || id.includes('/')) ||
  new Set(oldIds).size !== 3 ||
  new Set(newIds).size !== 3 ||
  new Set(placeIds).size !== 3
) {
  throw new Error('Supplier and Place identities must be three unique Firestore document ids.')
}

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `migrate-friiites-local-suppliers-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)

const expectedOldPaths = new Set()
const expectedNewPaths = new Set()
for (const supplier of manifest.suppliers) {
  expectedOldPaths.add(`places/${supplier.source_id}`)
  expectedOldPaths.add(`companies/${supplier.source_id}`)
  expectedOldPaths.add(`suppliers/${supplier.source_id}`)
  expectedNewPaths.add(`places/${supplier.place.id}`)
  expectedNewPaths.add(`companies/${supplier.place.id}`)
  expectedNewPaths.add(`suppliers/${supplier.id}`)
  for (const ingredientId of supplier.ingredient_ids) {
    expectedOldPaths.add(`suppliers/${supplier.source_id}/ingredients/${ingredientId}`)
    expectedOldPaths.add(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/supplier-ingredients/${supplier.source_id}--${ingredientId}`)
    expectedNewPaths.add(`suppliers/${supplier.id}/ingredients/${ingredientId}`)
    expectedNewPaths.add(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/supplier-ingredients/${supplier.id}--${ingredientId}`)
  }
}

const allIngredientIds = [...new Set(manifest.suppliers.flatMap(entry => entry.ingredient_ids))].sort()
const [kitchen, ...ingredients] = await db.getAll(
  db.doc(`apps/${APP_ID}/kitchens/${KITCHEN_ID}`),
  ...allIngredientIds.map(id => db.doc(`ingredients/${id}`))
)
if (!kitchen.exists) throw new Error('Friiites Kitchen support is missing.')
const missingIngredients = ingredients.filter(document => !document.exists).map(document => document.id)
if (missingIngredients.length) throw new Error(`Ingredient roots are missing: ${missingIngredients.join(', ')}`)

const oldSnapshots = await db.getAll(...[...expectedOldPaths].sort().map(path => db.doc(path)))
const newSnapshots = await db.getAll(...[...expectedNewPaths].sort().map(path => db.doc(path)))
const missingOldPaths = oldSnapshots.filter(document => !document.exists).map(document => document.ref.path)
const occupiedNewPaths = newSnapshots.filter(document => document.exists).map(document => document.ref.path)
if (missingOldPaths.length) throw new Error(`Prototype chain is incomplete: ${missingOldPaths.join(', ')}`)
if (occupiedNewPaths.length) throw new Error(`Canonical destination already exists: ${occupiedNewPaths.join(', ')}`)

const appIds = (await db.collection('apps').get()).docs.map(document => document.id)
const unexpectedSupports = []
for (const appId of appIds) {
  for (const oldId of oldIds) {
    const support = await db.doc(`apps/${appId}/suppliers/${oldId}`).get()
    if (support.exists) unexpectedSupports.push(support.ref.path)
  }
}
if (unexpectedSupports.length) {
  throw new Error(`Prototype Suppliers have unexpected App support: ${unexpectedSupports.join(', ')}`)
}

for (const supplier of manifest.suppliers) {
  const childCollections = await db.doc(`suppliers/${supplier.source_id}`).listCollections()
  const unexpectedCollections = childCollections.map(collection => collection.id).filter(id => id !== 'ingredients')
  if (unexpectedCollections.length) {
    throw new Error(`Prototype Supplier ${supplier.source_id} has unsupported child collections: ${unexpectedCollections.join(', ')}`)
  }
  const childIds = (await db.collection(`suppliers/${supplier.source_id}/ingredients`).get()).docs.map(document => document.id).sort()
  const expectedIds = [...supplier.ingredient_ids].sort()
  if (JSON.stringify(childIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`Prototype Supplier ${supplier.source_id} ingredient coverage changed.`)
  }
}

const matchingSlugs = []
const [placeRoots, supplierRoots] = await Promise.all([
  db.collection('places').get(),
  db.collection('suppliers').get(),
])
for (const supplier of manifest.suppliers) {
  for (const document of placeRoots.docs) {
    if (text(document.data()?.slug) === supplier.place.slug && document.id !== supplier.place.id) {
      matchingSlugs.push({ slug: supplier.place.slug, path: document.ref.path })
    }
  }
  for (const document of supplierRoots.docs) {
    if (text(document.data()?.slug) === supplier.id && document.id !== supplier.id) {
      matchingSlugs.push({ slug: supplier.id, path: document.ref.path })
    }
  }
}
if (matchingSlugs.length) throw new Error(`Destination slug is already used: ${JSON.stringify(matchingSlugs)}`)

const desired = manifest.suppliers.map(supplier => ({
  source_id: supplier.source_id,
  supplier_id: supplier.id,
  company_id: supplier.place.id,
  organization_name: supplier.organization_name,
  ingredient_ids: [...supplier.ingredient_ids].sort(),
}))
const operations = {
  creates: [...expectedNewPaths].sort(),
  deletes: [...expectedOldPaths].sort().reverse(),
}
const plan = {
  format: 'fireux-friiites-local-suppliers-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  app_id: APP_ID,
  kitchen_id: KITCHEN_ID,
  source_hashes: Object.fromEntries(oldSnapshots.map(document => [document.ref.path, sha256(document.data())]).sort(([left], [right]) => left.localeCompare(right))),
  desired,
  operations,
}
const planSha256 = sha256(plan)

if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(operations.creates.length || operations.deletes.length ? 2 : 0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm ${planSha256}`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires a new --backup /private/tmp/<name>.json path.')
}

const preimageDocuments = []
for (const path of [...new Set([...operations.creates, ...operations.deletes])].sort()) {
  const snapshot = await db.doc(path).get()
  const expectedHash = plan.source_hashes[path]
  if (expectedHash && (!snapshot.exists || sha256(snapshot.data()) !== expectedHash)) {
    throw new Error(`Migration source changed at ${path}. Re-plan before applying.`)
  }
  if (!expectedHash && snapshot.exists) {
    throw new Error(`Migration destination became occupied at ${path}. Re-plan before applying.`)
  }
  preimageDocuments.push({
    path,
    exists: snapshot.exists,
    data: snapshot.exists ? stableValue(snapshot.data()) : null,
  })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-friiites-local-suppliers-preimage/1',
    captured_at: new Date().toISOString(),
    plan_sha256: planSha256,
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    documents: preimageDocuments,
  },
})

const targetFor = (collectionPath, verbs) => defineFirestoreMutationTarget({
  key: `friiites-local-supplier-migration.${collectionPath}`,
  lane: 'mcp-skill',
  verbs,
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath,
})
const now = Timestamp.now()
const stamp = { at: now, by: ACTOR }

for (const supplier of manifest.suppliers) {
  const place = supplier.place
  await mcpSkillCreate(app, targetFor('places', ['create']), place.id, {
    name: place.name,
    short_name: supplier.organization_name,
    about: supplier.summary,
    slug: place.slug,
    place_type: 'physical',
    lat: place.lat,
    lng: place.lng,
    search_term: `${place.name} ${place.formatted_address}`.toLowerCase(),
    formatted_address: place.formatted_address,
    short_address: place.short_address,
    address: place.address,
    ...(place.phone ? { phone: place.phone } : {}),
    website: place.website,
    google_maps_url: place.google_maps_url,
    types: place.types,
    timezone: manifest.target.timezone,
    default_currency_code: manifest.target.currency_code,
    verified: true,
    created: { ...stamp, app_id: APP_ID },
    updated: stamp,
  })
  await mcpSkillCreate(app, targetFor('companies', ['create']), place.id, {
    created: { at: now },
    updated: { at: now },
  })
  await mcpSkillCreate(app, targetFor('suppliers', ['create']), supplier.id, {
    management: { mode: 'root' },
    company_id: place.id,
    slug: supplier.id,
    status: 'active',
    visibility: true,
    catalogue_state: 'directory_only',
    delivery_areas: [],
    created: stamp,
    updated: stamp,
  })
  for (const ingredientId of supplier.ingredient_ids) {
    await mcpSkillCreate(app, targetFor(`suppliers/${supplier.id}/ingredients`, ['create']), ingredientId, {
      supplier_id: supplier.id,
      ingredient_id: ingredientId,
      status: 'available',
      preferred_product_id: '',
      notes: 'Initial local sourcing option; confirm item availability before procurement.',
      active: true,
      created: { ...stamp, app_id: APP_ID },
      updated: stamp,
    })
    await mcpSkillCreate(app, targetFor(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/supplier-ingredients`, ['create']), `${supplier.id}--${ingredientId}`, {
      kitchen_id: KITCHEN_ID,
      supplier_id: supplier.id,
      ingredient_id: ingredientId,
      created: { ...stamp, app_id: APP_ID },
      updated: stamp,
    })
  }
}

for (const path of operations.creates) {
  if (!(await db.doc(path).get()).exists) {
    throw new Error(`Created destination is missing: ${path}. Backup: ${backup.path}`)
  }
}
for (const path of operations.deletes) {
  const segments = path.split('/')
  const id = segments.pop()
  const collectionPath = segments.join('/')
  await mcpSkillDelete(app, targetFor(collectionPath, ['delete']), id)
}

const failures = []
for (const path of operations.creates) {
  if (!(await db.doc(path).get()).exists) failures.push(`missing:${path}`)
}
for (const path of operations.deletes) {
  if ((await db.doc(path).get()).exists) failures.push(`retained:${path}`)
}
for (const supplier of manifest.suppliers) {
  const root = await db.doc(`suppliers/${supplier.id}`).get()
  const place = await db.doc(`places/${supplier.place.id}`).get()
  const supplierIngredients = await db.collection(`suppliers/${supplier.id}/ingredients`).get()
  if (
    text(root.data()?.company_id) !== supplier.place.id ||
    JSON.stringify(supplierIngredients.docs.map(document => document.id).sort()) !== JSON.stringify([...supplier.ingredient_ids].sort()) ||
    text(place.data()?.formatted_address) !== supplier.place.formatted_address ||
    text(place.data()?.timezone) !== manifest.target.timezone ||
    text(place.data()?.default_currency_code) !== manifest.target.currency_code
  ) {
    failures.push(`payload:${supplier.id}`)
  }
}
if (failures.length) throw new Error(`Post-migration verification failed: ${failures.join(', ')}. Backup: ${backup.path}`)

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  plan_sha256: planSha256,
  created: operations.creates,
  deleted: operations.deletes,
  backup,
}, null, 2))
await deleteApp(app)
