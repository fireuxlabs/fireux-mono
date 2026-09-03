#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-09-03
// usage_note: audit or create the two canonical draft system Menus beneath every Misebox Kitchen.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import {
  buildKitchenSystemMenu,
  KitchenSystemMenuKinds,
} from '../packages/extensions/fireux-kitchens/src/runtime/menu/utils/kitchen-system-menus.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const ACTOR = 'system:ensure-kitchen-system-menus'
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
  `ensure-misebox-kitchen-system-menus-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const [kitchensSnapshot, rootMenusSnapshot] = await Promise.all([
  db.collection('kitchens').get(),
  db.collection('menus').get(),
])
const appIdsByKitchen = new Map()
for (const document of rootMenusSnapshot.docs) {
  const source = record(document.get('source'))
  const kitchenId = text(source.kitchen_id)
  const appId = text(source.app_id)
  if (!kitchenId || !appId) continue
  const appIds = appIdsByKitchen.get(kitchenId) || new Set()
  appIds.add(appId)
  appIdsByKitchen.set(kitchenId, appIds)
}

const operations = []
const satisfied = []
for (const kitchenDocument of kitchensSnapshot.docs) {
  const kitchenId = kitchenDocument.id
  const kitchenData = kitchenDocument.data() || {}
  const appIds = [...(appIdsByKitchen.get(kitchenId) || [])]
  const appId =
    text(record(kitchenData.created).app_id) ||
    (appIds.length === 1 ? appIds[0] : '') ||
    'misebox-app'
  const targetSnapshots = await db.getAll(
    ...KitchenSystemMenuKinds.map((kind) =>
      db.doc(`kitchens/${kitchenId}/menus/${kind}`)
    )
  )
  for (const [index, targetSnapshot] of targetSnapshots.entries()) {
    const kind = KitchenSystemMenuKinds[index]
    if (!kind) throw new Error('System Menu kind is unavailable.')
    if (targetSnapshot.exists) {
      const current = targetSnapshot.data() || {}
      if (
        text(current.system_kind) !== kind ||
        text(current.kitchen_id) !== kitchenId
      ) {
        throw new Error(
          `Occupied default Menu id is incompatible: ${targetSnapshot.ref.path}`
        )
      }
      satisfied.push(targetSnapshot.ref.path)
      continue
    }
    operations.push({
      kitchenId,
      kind,
      appId,
      path: targetSnapshot.ref.path,
      kitchenSha256: sha256(kitchenData),
    })
  }
}

const plan = {
  format: 'fireux-misebox-kitchen-system-menus-plan/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  kitchenCount: kitchensSnapshot.size,
  satisfied,
  creates: operations,
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

const preimage = []
for (const operation of operations) {
  const [kitchenSnapshot, targetSnapshot] = await Promise.all([
    db.doc(`kitchens/${operation.kitchenId}`).get(),
    db.doc(operation.path).get(),
  ])
  if (
    !kitchenSnapshot.exists ||
    sha256(kitchenSnapshot.data()) !== operation.kitchenSha256 ||
    targetSnapshot.exists
  ) {
    throw new Error(`Migration plan changed at ${operation.path}.`)
  }
  preimage.push({ path: operation.path, exists: false })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-kitchen-system-menus-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: PROJECT_ID,
    databaseId: DATABASE_ID,
    documents: preimage,
  },
})

const now = Timestamp.now()
for (const operation of operations) {
  const target = defineFirestoreMutationTarget({
    key: `misebox.kitchen-system-menus.${operation.kitchenId}`,
    lane: 'mcp-skill',
    verbs: ['create'],
    database: { kind: 'named', databaseId: DATABASE_ID },
    collectionPath: `kitchens/${operation.kitchenId}/menus`,
  })
  await mcpSkillCreate(
    app,
    target,
    operation.kind,
    buildKitchenSystemMenu({
      kitchenId: operation.kitchenId,
      kind: operation.kind,
      created: { at: now, by: ACTOR, app_id: operation.appId },
      updated: { at: now, by: ACTOR },
    })
  )
}

const verified = await db.getAll(
  ...operations.map((operation) => db.doc(operation.path))
)
for (const [index, snapshot] of verified.entries()) {
  const operation = operations[index]
  if (
    !operation ||
    !snapshot.exists ||
    text(snapshot.get('system_kind')) !== operation.kind ||
    text(snapshot.get('kitchen_id')) !== operation.kitchenId ||
    text(snapshot.get('status')) !== 'draft'
  ) {
    throw new Error(
      `Post-create verification failed at ${operation?.path || '<unknown>'}. Backup: ${backup.path}`
    )
  }
}

console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ok: true,
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      plan_sha256: planSha256,
      createdPaths: operations.map((operation) => operation.path),
      satisfied,
      backup,
    },
    null,
    2
  )
)
await deleteApp(app)
