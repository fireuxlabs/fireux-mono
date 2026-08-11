#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or attach the fixed Friiites Ingredient roots to Friiites Interlaken through create-only Kitchen usage records.

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
const KITCHEN_PATH = `apps/${APP_ID}/kitchens/${KITCHEN_ID}`
const COLLECTION_PATH = `${KITCHEN_PATH}/ingredients`
const ACTOR = 'system:attach-friiites-kitchen-ingredients'
const MANIFEST_PATH = fileURLToPath(new URL('./data/friiites-ingredient-roots.json', import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map((token) => {
  const [key, ...rest] = token.replace(/^--/, '').split('=')
  return [key, rest.length ? rest.join('=') : true]
}))
const text = value => String(value ?? '').trim()
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')

if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const ingredientIds = manifest.entries?.map(entry => text(entry.id)).filter(Boolean) || []
if (manifest.format !== 'fireux-friiites-ingredient-roots/1' || ingredientIds.length !== 11) {
  throw new Error('Friiites Ingredient manifest is invalid.')
}

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `friiites-kitchen-ingredients-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const [kitchen, ...roots] = await db.getAll(
  db.doc(KITCHEN_PATH),
  ...ingredientIds.map(id => db.doc(`ingredients/${id}`))
)
if (!kitchen.exists) throw new Error(`Friiites Kitchen is missing at ${KITCHEN_PATH}.`)
const missingRoots = roots.filter(root => !root.exists).map(root => root.id)
if (missingRoots.length) throw new Error(`Canonical Ingredient roots are missing: ${missingRoots.join(', ')}`)

const existing = await db.collection(COLLECTION_PATH).get()
const existingIds = new Set(existing.docs.map(doc => doc.id))
const creates = ingredientIds.filter(id => !existingIds.has(id))
const preserved = ingredientIds.filter(id => existingIds.has(id))
const plan = {
  format: 'fireux-friiites-kitchen-ingredient-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  app_id: APP_ID,
  kitchen_id: KITCHEN_ID,
  collection_path: COLLECTION_PATH,
  creates,
  preserved,
}
const planSha256 = hash(plan)
if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm=${planSha256}.`)

const target = defineFirestoreMutationTarget({
  key: 'misebox.friiites-kitchen-ingredients',
  lane: 'mcp-skill',
  verbs: ['create'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: COLLECTION_PATH,
})
const now = Timestamp.now()
for (const ingredientId of creates) {
  await mcpSkillCreate(app, target, ingredientId, {
    ingredient_id: ingredientId,
    created: { at: now, by: ACTOR, app_id: APP_ID },
    updated: { at: now, by: ACTOR },
  })
}

const verified = await db.getAll(...ingredientIds.map(id => db.doc(`${COLLECTION_PATH}/${id}`)))
const failures = verified.filter(doc => !doc.exists || text(doc.data()?.ingredient_id) !== doc.id).map(doc => doc.id)
if (failures.length) throw new Error(`Kitchen Ingredient verification failed: ${failures.join(', ')}`)
console.log(JSON.stringify({ mode: 'apply', ok: true, created: creates, preserved, verified: verified.map(doc => doc.id), plan_sha256: planSha256 }, null, 2))
await deleteApp(app)
