#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: plan or explicitly move legacy root Customer Order links into their canonical App-owned Customer scope with confirmation, preimage, and verification.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const apply = args.apply === true
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({ args, scope: ecosystem, projectId: target.projectId })
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `migrate-customer-order-links-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)
const text = value => String(value ?? '').trim()

const stableValue = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stableValue)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stableValue(child)]))
}
const stableJson = value => JSON.stringify(stableValue(value))
const sha256 = value => createHash('sha256').update(stableJson(value)).digest('hex')

const snapshot = await db.collectionGroup('orders').get()
const operations = snapshot.docs.flatMap((doc) => {
  const segments = doc.ref.path.split('/')
  if (segments.length !== 4 || segments[0] !== 'customers' || segments[2] !== 'orders') return []
  const data = doc.data() || {}
  const uid = segments[1]
  const appId = text(data.app_id)
  const { id: _storedId, ...targetData } = data
  const match = text(data.order_path).match(/^apps\/([^/]+)\/kitchens\/([^/]+)\/orders\/([^/]+)$/)
  if (!appId || !match || match[1] !== appId || match[3] !== doc.id) {
    throw new Error(`Legacy Customer Order link is not safely scoped: ${doc.ref.path}`)
  }
  return [{
    id: doc.id,
    uid,
    appId,
    sourceCollection: `customers/${uid}/orders`,
    sourcePath: doc.ref.path,
    targetCollection: `apps/${appId}/customers/${uid}/orders`,
    targetPath: `apps/${appId}/customers/${uid}/orders/${doc.id}`,
    sourceSha256: sha256(data),
    targetSha256: sha256(targetData),
    targetData,
  }]
})
const plan = {
  format: 'fireux-misebox-customer-order-link-plan/1',
  projectId: target.projectId || auth.projectId,
  databaseId,
  operations: operations.map(({ targetData, ...operation }) => ({
    ...operation,
    targetData: stableValue(targetData),
  })),
}
const planSha256 = sha256(plan)

if (!apply) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  process.exit(operations.length ? 2 : 0)
}

if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm ${planSha256}`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires a new --backup /private/tmp/<name>.json path.')
}

const preimage = []
for (const operation of operations) {
  const [source, destination] = await Promise.all([
    db.doc(operation.sourcePath).get(),
    db.doc(operation.targetPath).get(),
  ])
  if (!source.exists || sha256(source.data()) !== operation.sourceSha256) {
    throw new Error(`Migration plan changed at ${operation.sourcePath}`)
  }
  if (destination.exists && sha256(destination.data()) !== operation.targetSha256) {
    throw new Error(`Canonical destination already differs: ${operation.targetPath}`)
  }
  preimage.push(
    { path: operation.sourcePath, exists: source.exists, data: stableValue(source.data()) },
    { path: operation.targetPath, exists: destination.exists, data: destination.exists ? stableValue(destination.data()) : null }
  )
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-customer-order-link-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: target.projectId || auth.projectId,
    databaseId,
    documents: preimage,
  },
})

const mutationTarget = collectionPath => defineFirestoreMutationTarget({
  key: `customer-order-link-migration.${collectionPath}`,
  lane: 'mcp-skill',
  verbs: ['create', 'delete'],
  database: { kind: 'named', databaseId },
  collectionPath,
})

for (const operation of operations) {
  const destination = await db.doc(operation.targetPath).get()
  if (!destination.exists) {
    await mcpSkillCreate(app, mutationTarget(operation.targetCollection), operation.id, operation.targetData)
  }
  const verified = await db.doc(operation.targetPath).get()
  if (!verified.exists || sha256(verified.data()) !== operation.targetSha256) {
    throw new Error(`Canonical destination verification failed: ${operation.targetPath}. Backup: ${backup.path}`)
  }
  await mcpSkillDelete(app, mutationTarget(operation.sourceCollection), operation.id)
}

const failures = []
for (const operation of operations) {
  const [source, destination] = await Promise.all([
    db.doc(operation.sourcePath).get(),
    db.doc(operation.targetPath).get(),
  ])
  if (source.exists || !destination.exists || sha256(destination.data()) !== operation.targetSha256) {
    failures.push({ source: operation.sourcePath, target: operation.targetPath })
  }
}
if (failures.length) throw new Error(`Post-migration verification failed. Backup: ${backup.path}`)

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  moved: operations.length,
  plan_sha256: planSha256,
  backup,
}, null, 2))
