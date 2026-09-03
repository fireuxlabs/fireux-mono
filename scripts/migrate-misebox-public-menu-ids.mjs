#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-09-03
// usage_note: plan or apply the protected Kitchen-qualified public Menu id cutover in Misebox.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import { publicKitchenMenuId } from '../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-menu-route.ts'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const ACTOR = 'system:migrate-misebox-public-menu-ids'
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const canonicalSlug = (value, label) => {
  const candidate = text(value)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)) {
    throw new Error(
      `${label} is not a canonical slug: ${candidate || '<empty>'}.`
    )
  }
  return candidate
}
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
  `migrate-misebox-public-menu-ids-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const rootMenus = await db.collection('menus').get()
const operations = []

for (const sourceSnapshot of rootMenus.docs) {
  const sourceData = sourceSnapshot.data() || {}
  const source = record(sourceData.source)
  const kitchenId = text(source.kitchen_id)
  const menuId = text(source.menu_id)
  if (
    text(sourceData.status) !== 'published' ||
    text(sourceData.kind) !== 'menu' ||
    !kitchenId ||
    !menuId
  ) {
    continue
  }

  const kitchenSnapshot = await db.collection('kitchens').doc(kitchenId).get()
  if (!kitchenSnapshot.exists) {
    throw new Error(`Missing source Kitchen for menus/${sourceSnapshot.id}.`)
  }
  const kitchenSlug = canonicalSlug(
    kitchenSnapshot.get('slug'),
    `Kitchen ${kitchenId} slug`
  )
  canonicalSlug(menuId, `Menu ${sourceSnapshot.id} source.menu_id`)
  const targetId = publicKitchenMenuId(kitchenSlug, menuId)
  if (!targetId) {
    throw new Error(
      `Missing qualified identity for menus/${sourceSnapshot.id}.`
    )
  }
  if (targetId === sourceSnapshot.id) continue

  const targetSnapshot = await db.collection('menus').doc(targetId).get()
  if (targetSnapshot.exists) {
    const targetSource = record(targetSnapshot.get('source'))
    if (
      text(targetSource.kitchen_id) !== kitchenId ||
      text(targetSource.menu_id) !== menuId
    ) {
      throw new Error(`Occupied target Menu id: menus/${targetId}.`)
    }
  }
  operations.push({
    sourceId: sourceSnapshot.id,
    targetId,
    kitchenId,
    menuId,
    sourceData,
    targetExists: targetSnapshot.exists,
    targetData: targetSnapshot.data() || null,
  })
}

const plan = {
  format: 'misebox-public-menu-id-cutover/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  operations: operations.map(({ sourceId, targetId, kitchenId, menuId }) => ({
    sourceId,
    targetId,
    kitchenId,
    menuId,
  })),
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
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'misebox-public-menu-id-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    documents: operations.flatMap((operation) => [
      {
        path: `menus/${operation.sourceId}`,
        exists: true,
        data: stable(operation.sourceData),
      },
      {
        path: `menus/${operation.targetId}`,
        exists: operation.targetExists,
        data: stable(operation.targetData),
      },
    ]),
  },
})
const rootTarget = defineFirestoreMutationTarget({
  key: 'misebox.public-menu-id-cutover.root-menus',
  lane: 'mcp-skill',
  verbs: ['create', 'update'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: 'menus',
})
const now = Timestamp.now()

for (const operation of operations) {
  const targetData = {
    ...operation.sourceData,
    id: operation.targetId,
    status: 'published',
    updated: { at: now, by: ACTOR },
  }
  if (operation.targetExists) {
    await mcpSkillUpdate(app, rootTarget, operation.targetId, targetData)
  } else {
    await mcpSkillCreate(app, rootTarget, operation.targetId, targetData)
  }
  await mcpSkillUpdate(app, rootTarget, operation.sourceId, {
    status: 'archived',
    superseded_by: operation.targetId,
    updated: { at: now, by: ACTOR },
  })
}

for (const operation of operations) {
  const [sourceSnapshot, targetSnapshot] = await db.getAll(
    db.collection('menus').doc(operation.sourceId),
    db.collection('menus').doc(operation.targetId)
  )
  const targetSource = record(targetSnapshot.get('source'))
  if (
    text(sourceSnapshot.get('status')) !== 'archived' ||
    text(sourceSnapshot.get('superseded_by')) !== operation.targetId ||
    text(targetSnapshot.get('status')) !== 'published' ||
    text(targetSource.kitchen_id) !== operation.kitchenId ||
    text(targetSource.menu_id) !== operation.menuId
  ) {
    throw new Error(`Verification failed for menus/${operation.sourceId}.`)
  }
}

console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ok: true,
      plan_sha256: planSha256,
      migrated: operations.length,
      backup,
      routes: operations.map(({ targetId }) => `/menus/${targetId}`),
    },
    null,
    2
  )
)
await deleteApp(app)
