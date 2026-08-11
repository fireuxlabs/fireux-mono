#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or apply the protected Console-root management cutover for one ecosystem database.

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
const ecosystem = String(args.ecosystem || '').trim()
const databaseId = String(args.database || '').trim()
const apply = args.apply === true
const summary = args.summary === true
const collections = ['blanks', 'kitchens', 'portfolios', 'properties', 'suppliers']

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ecosystem) || !databaseId) {
  throw new Error(
    'Usage: node scripts/migrate-console-entity-management.mjs --ecosystem <key> --database <id> [--apply --confirm <hash> --backup /private/tmp/<file>.json]'
  )
}
const ecosystemAppId = `${ecosystem}-app`

const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `migrate-entity-management-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)
const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stableValue = value => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stableValue)
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableValue(child)])
  )
}
const sha256 = value =>
  createHash('sha256')
    .update(JSON.stringify(stableValue(value)))
    .digest('hex')

function currentManagement(data) {
  const management = record(data.management)
  const keys = Object.keys(management).sort()
  if (
    (management.mode === 'root' || management.mode === 'console') &&
    keys.length === 1 &&
    keys[0] === 'mode'
  ) return management
  if (
    management.mode === 'app' &&
    keys.length === 2 &&
    keys[0] === 'app_id' &&
    keys[1] === 'mode' &&
    text(management.app_id)
  ) return management
  return null
}

function managementFor(data) {
  const existing = currentManagement(data)
  const hasOldFlat =
    Object.hasOwn(data, 'app_scope_state') ||
    Object.hasOwn(data, 'app_scope_app_id') ||
    Object.hasOwn(data, 'app_scope')
  const hasOldKitchen = Object.hasOwn(data, 'console')
  if (existing && !hasOldFlat && !hasOldKitchen) return null
  if (existing && (hasOldFlat || hasOldKitchen)) return existing

  const kitchenConsole = record(data.console)
  const kitchenAppId = text(kitchenConsole.app_id)
  if (kitchenAppId) {
    return kitchenAppId === ecosystemAppId
      ? { mode: 'console' }
      : { mode: 'app', app_id: kitchenAppId }
  }

  const nestedScope = record(data.app_scope)
  const state = text(data.app_scope_state || nestedScope.state)
  const appId = text(data.app_scope_app_id || nestedScope.app_id)
  if (state === 'root_only' && !appId) return { mode: 'root' }
  if (
    (state === 'parent_app' || state === 'tenant_app' || state === 'dedicated_app') &&
    appId
  ) {
    return appId === ecosystemAppId
      ? { mode: 'console' }
      : { mode: 'app', app_id: appId }
  }
  throw new Error('Stored management cannot be resolved without guessing.')
}

const operations = []
const appIds = (await db.collection('apps').get()).docs.map(document => document.id)
for (const collectionName of collections) {
  const snapshot = await db.collection(collectionName).get()
  for (const document of snapshot.docs) {
    const data = document.data() || {}
    let management
    try {
      management = managementFor(data)
    } catch (error) {
      const supportSnapshots = await Promise.all(
        appIds.map(appId => db.doc(`apps/${appId}/${collectionName}/${document.id}`).get())
      )
      const supportAppIds = supportSnapshots
        .filter(snapshot => snapshot.exists)
        .map(snapshot => snapshot.ref.parent.parent?.id)
        .filter(Boolean)
      if (supportAppIds.length > 1) {
        throw new Error(
          `${document.ref.path}: ${error.message} Found ${supportAppIds.length} matching App support records.`
        )
      }
      const supportAppId = supportAppIds[0] || ''
      management = !supportAppId
        ? { mode: 'root' }
        : supportAppId === ecosystemAppId
          ? { mode: 'console' }
          : { mode: 'app', app_id: supportAppId }
    }
    if (!management) continue
    operations.push({
      collectionName,
      id: document.id,
      path: document.ref.path,
      sourceSha256: sha256(data),
      management,
    })
  }
}

const plan = {
  format: 'fireux-console-entity-management-plan/1',
  projectId: target.projectId || auth.projectId,
  databaseId,
  ecosystemAppId,
  operations,
}
const planSha256 = sha256(plan)

if (!apply) {
  console.log(JSON.stringify(
    summary
      ? {
          mode: 'plan',
          plan_sha256: planSha256,
          projectId: plan.projectId,
          databaseId,
          ecosystemAppId,
          operationCount: operations.length,
          counts: Object.fromEntries(
            collections.map(collectionName => [
              collectionName,
              operations.filter(operation => operation.collectionName === collectionName).length,
            ])
          ),
        }
      : { mode: 'plan', plan_sha256: planSha256, ...plan },
    null,
    2
  ))
  process.exit(operations.length ? 2 : 0)
}

if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm ${planSha256}`)
}
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
  documents.push({
    path: operation.path,
    exists: true,
    data: stableValue(snapshot.data()),
  })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-console-entity-management-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: target.projectId || auth.projectId,
    databaseId,
    documents,
  },
})

for (const operation of operations) {
  const mutationTarget = defineFirestoreMutationTarget({
    key: `entity-management-migration.${operation.collectionName}`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId },
    collectionPath: operation.collectionName,
  })
  await mcpSkillUpdate(app, mutationTarget, operation.id, {
    management: operation.management,
    app_scope: FieldValue.delete(),
    app_scope_state: FieldValue.delete(),
    app_scope_app_id: FieldValue.delete(),
    console: FieldValue.delete(),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: 'fireux-entity-management-migration',
    },
  })
  const verified = await db.doc(operation.path).get()
  const verifiedData = verified.data() || {}
  if (
    !verified.exists ||
    sha256(verifiedData.management) !== sha256(operation.management) ||
    ['app_scope', 'app_scope_state', 'app_scope_app_id', 'console'].some(key =>
      Object.hasOwn(verifiedData, key)
    )
  ) {
    throw new Error(
      `Post-migration verification failed at ${operation.path}. Backup: ${backup.path}`
    )
  }
}

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  updated: operations.length,
  plan_sha256: planSha256,
  backup,
}, null, 2))
