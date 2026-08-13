#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or create the fixed Place-backed prototype Friiites Suppliers, Ingredient coverage, and Kitchen links.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'friiites'
const KITCHEN_ID = '5dGJgdjDv7Zi0tjva61O'
const ACTOR = 'system:seed-friiites-prototype-suppliers'
const MANIFEST_PATH = fileURLToPath(new URL('./data/friiites-prototype-suppliers.json', import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map(token => {
  const [key, ...rest] = token.replace(/^--/, '').split('=')
  return [key, rest.length ? rest.join('=') : true]
}))
const text = value => String(value ?? '').trim()
const sha256 = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
if (manifest.format !== 'fireux-friiites-prototype-suppliers/1' || manifest.suppliers?.length !== 3) throw new Error('Prototype Supplier manifest is invalid.')
const allIngredientIds = [...new Set(manifest.suppliers.flatMap(supplier => supplier.ingredient_ids))].sort()
const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `friiites-prototype-suppliers-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const [kitchen, ...ingredientRoots] = await db.getAll(db.doc(`apps/${APP_ID}/kitchens/${KITCHEN_ID}`), ...allIngredientIds.map(id => db.doc(`ingredients/${id}`)))
if (!kitchen.exists) throw new Error('Friiites Interlaken Kitchen is missing.')
const missingIngredients = ingredientRoots.filter(doc => !doc.exists).map(doc => doc.id)
if (missingIngredients.length) throw new Error(`Ingredient roots are missing: ${missingIngredients.join(', ')}`)

const plannedCreates = []
const preserved = []
const pathsFor = supplier => [
  `places/${supplier.id}`,
  `companies/${supplier.id}`,
  `suppliers/${supplier.id}`,
  ...supplier.ingredient_ids.flatMap(ingredientId => [
    `suppliers/${supplier.id}/ingredients/${ingredientId}`,
    `apps/${APP_ID}/kitchens/${KITCHEN_ID}/supplier-ingredients/${supplier.id}--${ingredientId}`,
    `apps/${APP_ID}/kitchens/${KITCHEN_ID}/ingredients/${ingredientId}`,
  ]),
]
const desiredPaths = manifest.suppliers.flatMap(pathsFor)
const existing = await db.getAll(...desiredPaths.map(path => db.doc(path)))
for (let index = 0; index < desiredPaths.length; index += 1) {
  ;(existing[index].exists ? preserved : plannedCreates).push(desiredPaths[index])
}
const plan = { format: 'fireux-friiites-prototype-supplier-plan/1', project_id: PROJECT_ID, database_id: DATABASE_ID, app_id: APP_ID, kitchen_id: KITCHEN_ID, creates: plannedCreates, preserved }
const planSha256 = sha256(plan)
if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm=${planSha256}.`)

const targetFor = collectionPath => defineFirestoreMutationTarget({ key: `misebox.friiites-prototype.${collectionPath}`, lane: 'mcp-skill', verbs: ['create'], database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath })
const now = Timestamp.now()
const stamp = { at: now, by: ACTOR }
const createIfMissing = async (collectionPath, id, data) => {
  const ref = db.doc(`${collectionPath}/${id}`)
  if ((await ref.get()).exists) return
  await mcpSkillCreate(app, targetFor(collectionPath), id, data)
}

for (const supplier of manifest.suppliers) {
  await createIfMissing('places', supplier.id, { name: supplier.name, place_type: 'non_physical', source: 'manual', slug: supplier.id, created: stamp, updated: stamp })
  await createIfMissing('companies', supplier.id, { created: { at: now }, updated: { at: now } })
  await createIfMissing('suppliers', supplier.id, {
    management: { mode: 'root' }, company_id: supplier.id, slug: supplier.id,
    supplier_organization_name: supplier.name, tagline: '', supplier_headline: '', summary: supplier.summary,
    supplier_bio: '', supplier_image: '', supplier_item_categories: [], supplier_delivery_areas: [],
    state: 'public', catalogue_state: 'public_only', linked_ingredient_ids: supplier.ingredient_ids,
    hello: '', created: stamp, updated: stamp,
  })
  for (const ingredientId of supplier.ingredient_ids) {
    await createIfMissing(`suppliers/${supplier.id}/ingredients`, ingredientId, {
      supplier_id: supplier.id, ingredient_id: ingredientId, status: 'available', preferred_product_id: '',
      notes: 'Prototype coverage; confirm the real Supplier Item before procurement.', active: true,
      created: { ...stamp, app_id: APP_ID }, updated: stamp,
    })
    await createIfMissing(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/supplier-ingredients`, `${supplier.id}--${ingredientId}`, {
      kitchen_id: KITCHEN_ID, supplier_id: supplier.id, ingredient_id: ingredientId,
      created: { ...stamp, app_id: APP_ID }, updated: stamp,
    })
    await createIfMissing(`apps/${APP_ID}/kitchens/${KITCHEN_ID}/ingredients`, ingredientId, {
      ingredient_id: ingredientId, created: { ...stamp, app_id: APP_ID }, updated: stamp,
    })
  }
}

const verified = await db.getAll(...desiredPaths.map(path => db.doc(path)))
const failures = verified.filter(doc => !doc.exists).map((doc, index) => desiredPaths[index])
if (failures.length) throw new Error(`Prototype Supplier verification failed: ${failures.join(', ')}`)
console.log(JSON.stringify({ mode: 'apply', ok: true, created: plannedCreates, preserved, verified_count: verified.length, plan_sha256: planSha256 }, null, 2))
await deleteApp(app)
