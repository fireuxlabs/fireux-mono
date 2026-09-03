#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-09-03
// usage_note: audit or set Food as the primary Menu only where a Misebox Kitchen has no selected primary Menu.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const PRIMARY_MENU_ID = 'food'
const ACTOR = 'system:ensure-kitchen-primary-menu'
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')

if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)
}

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `ensure-misebox-kitchen-primary-menu-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const kitchens = await db.collection('kitchens').get()
const updates = []
const satisfied = []
for (const kitchen of kitchens.docs) {
  const data = kitchen.data() || {}
  const currentPrimary = text(record(data.menus).primary_menu_id)
  if (currentPrimary) {
    satisfied.push({ path: kitchen.ref.path, primaryMenuId: currentPrimary })
    continue
  }
  const food = await kitchen.ref.collection('menus').doc(PRIMARY_MENU_ID).get()
  if (
    !food.exists ||
    text(food.get('system_kind')) !== PRIMARY_MENU_ID ||
    text(food.get('kitchen_id')) !== kitchen.id
  ) {
    throw new Error(`Kitchen has no compatible Food Menu: ${kitchen.ref.path}`)
  }
  updates.push({
    id: kitchen.id,
    path: kitchen.ref.path,
    sourceSha256: sha256(data),
  })
}

const plan = {
  format: 'fireux-misebox-kitchen-primary-menu-plan/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  kitchenCount: kitchens.size,
  primaryMenuId: PRIMARY_MENU_ID,
  satisfied,
  updates,
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(
    JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2)
  )
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm=${planSha256}.`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires --backup=/private/tmp/<name>.json.')
}
const documents = []
for (const operation of updates) {
  const snapshot = await db.doc(operation.path).get()
  if (!snapshot.exists || sha256(snapshot.data()) !== operation.sourceSha256) {
    throw new Error(`Migration plan changed at ${operation.path}.`)
  }
  documents.push({
    path: operation.path,
    exists: true,
    data: stable(snapshot.data()),
  })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-kitchen-primary-menu-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: PROJECT_ID,
    databaseId: DATABASE_ID,
    documents,
  },
})

const target = defineFirestoreMutationTarget({
  key: 'misebox.kitchen-primary-menu',
  lane: 'mcp-skill',
  verbs: ['update'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: 'kitchens',
})
const now = Timestamp.now()
for (const operation of updates) {
  await mcpSkillUpdate(app, target, operation.id, {
    'menus.primary_menu_id': PRIMARY_MENU_ID,
    updated: { at: now, by: ACTOR },
  })
}

const verified = await db.getAll(
  ...updates.map((operation) => db.doc(operation.path))
)
if (
  verified.some(
    (snapshot) =>
      text(record(snapshot.data()?.menus).primary_menu_id) !== 'food'
  )
) {
  throw new Error(`Post-update verification failed. Backup: ${backup.path}`)
}
console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ok: true,
      plan_sha256: planSha256,
      updatedPaths: updates.map((operation) => operation.path),
      satisfied,
      backup,
    },
    null,
    2
  )
)
await deleteApp(app)
