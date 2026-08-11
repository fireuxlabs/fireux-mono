#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or create the fixed, image-optional Friiites Ingredient roots through the MCP/Skill mutation lane.

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
const COLLECTION_ID = 'ingredients'
const ACTOR = 'system:add-friiites-ingredient-roots'
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
if (manifest.format !== 'fireux-friiites-ingredient-roots/1' || manifest.entries?.length !== 11) {
  throw new Error('Friiites Ingredient manifest is invalid.')
}

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `friiites-ingredients-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const snapshot = await db.collection(COLLECTION_ID).get()
const existing = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
const claims = new Map()
for (const item of existing) {
  if (item.status !== 'active') continue
  for (const label of [item.name, ...(Array.isArray(item.aliases) ? item.aliases : [])]) {
    if (text(label)) claims.set(text(label).toLocaleLowerCase('en'), item.id)
  }
}

const collisions = []
for (const entry of manifest.entries) {
  if (existing.some(item => item.id === entry.id)) collisions.push(`${entry.id}: id exists`)
  for (const label of [entry.name, ...entry.aliases]) {
    const owner = claims.get(label.toLocaleLowerCase('en'))
    if (owner) collisions.push(`${entry.id}: ${JSON.stringify(label)} claimed by ${owner}`)
  }
}
if (collisions.length) throw new Error(`Ingredient collisions:\n${collisions.join('\n')}`)

const plan = {
  format: 'fireux-friiites-ingredient-root-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  creates: manifest.entries,
}
const planSha256 = hash(plan)
if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm=${planSha256}.`)

const target = defineFirestoreMutationTarget({
  key: 'misebox.friiites-ingredient-roots',
  lane: 'mcp-skill',
  verbs: ['create'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: COLLECTION_ID,
})
const now = Timestamp.now()
for (const entry of manifest.entries) {
  await mcpSkillCreate(app, target, entry.id, {
    schema_version: 2,
    slug: entry.id,
    name: entry.name,
    aliases: entry.aliases,
    category: entry.category,
    kind: entry.kind,
    status: 'active',
    image_url: '',
    created: { at: now, by: ACTOR, app_id: 'friiites' },
    updated: { at: now, by: ACTOR },
  })
}

const verified = await db.getAll(...manifest.entries.map(entry => db.doc(`${COLLECTION_ID}/${entry.id}`)))
if (verified.some(doc => !doc.exists)) throw new Error('Post-create Ingredient verification failed.')
console.log(JSON.stringify({ mode: 'apply', ok: true, created: verified.map(doc => doc.id), plan_sha256: planSha256 }, null, 2))
await deleteApp(app)
