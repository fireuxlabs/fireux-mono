#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: plan or explicitly remove inert AppKitchen authority ids that have neither App membership nor an operational Kitchen Team record.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
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
  `migrate-kitchen-authority-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)
const text = value => String(value ?? '').trim()
const stableValue = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stableValue)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stableValue(child)]))
}
const sha256 = value => createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex')

const appSnapshot = await db.collection('apps').get()
const operations = []
for (const appDoc of appSnapshot.docs) {
  const [supportSnapshot, membershipSnapshot] = await Promise.all([
    appDoc.ref.collection('kitchens').get(),
    appDoc.ref.collection('users').get(),
  ])
  const memberIds = new Set(membershipSnapshot.docs.map(doc => doc.id))
  for (const supportDoc of supportSnapshot.docs) {
    const data = supportDoc.data() || {}
    const operatorIds = Array.isArray(data.operator_ids) ? data.operator_ids.map(text) : []
    const teamIds = Array.isArray(data.team_ids) ? data.team_ids.map(text) : []
    const candidates = [...new Set([...operatorIds, ...teamIds])]
      .filter(uid => uid && !memberIds.has(uid))
    if (!candidates.length) continue
    const teamSnapshot = await supportDoc.ref.collection('team').get()
    const operationalUsers = new Set(
      teamSnapshot.docs.map(doc => text(doc.data().user_id)).filter(Boolean)
    )
    const removeIds = candidates.filter(uid => !operationalUsers.has(uid))
    if (!removeIds.length) continue
    operations.push({
      appId: appDoc.id,
      kitchenId: supportDoc.id,
      path: supportDoc.ref.path,
      collectionPath: `apps/${appDoc.id}/kitchens`,
      sourceSha256: sha256(data),
      removeIds,
      operatorIds: operatorIds.filter(uid => !removeIds.includes(uid)),
      teamIds: teamIds.filter(uid => !removeIds.includes(uid)),
    })
  }
}

const plan = {
  format: 'fireux-misebox-kitchen-authority-plan/1',
  projectId: target.projectId || auth.projectId,
  databaseId,
  operations,
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  process.exit(operations.length ? 2 : 0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm ${planSha256}`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires a new --backup /private/tmp/<name>.json path.')
}

const documents = []
for (const operation of operations) {
  const snapshot = await db.doc(operation.path).get()
  if (!snapshot.exists || sha256(snapshot.data()) !== operation.sourceSha256) {
    throw new Error(`Migration plan changed at ${operation.path}`)
  }
  documents.push({ path: operation.path, exists: true, data: stableValue(snapshot.data()) })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-kitchen-authority-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: target.projectId || auth.projectId,
    databaseId,
    documents,
  },
})

for (const operation of operations) {
  const mutationTarget = defineFirestoreMutationTarget({
    key: `kitchen-authority-migration.${operation.appId}`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId },
    collectionPath: operation.collectionPath,
  })
  await mcpSkillUpdate(app, mutationTarget, operation.kitchenId, {
    operator_ids: operation.operatorIds,
    team_ids: operation.teamIds,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: 'fireux-kitchen-authority-migration',
    },
  })
  const verified = await db.doc(operation.path).get()
  const data = verified.data() || {}
  if (
    !verified.exists ||
    sha256(data.operator_ids || []) !== sha256(operation.operatorIds) ||
    sha256(data.team_ids || []) !== sha256(operation.teamIds)
  ) {
    throw new Error(`Post-migration verification failed at ${operation.path}. Backup: ${backup.path}`)
  }
}

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  updated: operations.length,
  removed_ids: operations.reduce((count, operation) => count + operation.removeIds.length, 0),
  plan_sha256: planSha256,
  backup,
}, null, 2))
