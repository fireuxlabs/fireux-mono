#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or explicitly migrate Property, Portfolio, and Supplier roots from retired flat App scope fields to their domain-owned Console attachment.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillAtomicSet } from './_lib/firestore-mutations/mcp-skill-transaction.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const TARGETS = {
  buenohost: {
    projectId: 'buenohost-ecosystem',
    databaseId: 'buenohost',
    collections: ['properties', 'portfolios'],
  },
  granite: {
    projectId: 'granite-ecosystem',
    databaseId: 'granite',
    collections: ['properties', 'portfolios'],
  },
  bringli: {
    projectId: 'bringli-b0517',
    databaseId: 'bringli',
    collections: ['suppliers'],
  },
}

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem ?? '').trim()
const config = TARGETS[ecosystem]
if (!config) {
  throw new Error(`--ecosystem must be one of: ${Object.keys(TARGETS).join(', ')}`)
}

const apply = args.apply === true
const confirmation = `MIGRATE_${ecosystem.toUpperCase()}_CONSOLE_ROOT_ATTACHMENTS`
const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = value => {
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
const hash = value => createHash('sha256')
  .update(JSON.stringify(stable(value)))
  .digest('hex')

function readLegacyAttachment(path, source) {
  if (Object.hasOwn(source, 'app_scope') || Object.hasOwn(source, 'app_id')) {
    throw new Error(`${path} contains an unsupported App scope representation.`)
  }
  const hasState = Object.hasOwn(source, 'app_scope_state')
  const hasAppId = Object.hasOwn(source, 'app_scope_app_id')
  const hasConsole = Object.hasOwn(source, 'console')
  if (hasConsole && (hasState || hasAppId)) {
    throw new Error(`${path} mixes current and retired App attachment fields.`)
  }
  if (hasConsole) {
    const console = record(source.console)
    const keys = Object.keys(console).sort()
    if (
      keys.length !== 2 ||
      keys[0] !== 'app_id' ||
      keys[1] !== 'app_role' ||
      !text(console.app_id) ||
      (console.app_role !== 'parent' && console.app_role !== 'tenant')
    ) {
      throw new Error(`${path} has an invalid Console attachment.`)
    }
    return { current: true, console }
  }
  if (!hasState && !hasAppId) return { current: true, console: null }
  if (!hasState || !hasAppId) {
    throw new Error(`${path} has an incomplete retired App scope.`)
  }
  const state = text(source.app_scope_state)
  const appId = text(source.app_scope_app_id)
  if (state === 'root_only' && !appId) return { current: false, console: null }
  if ((state === 'parent_app' || state === 'tenant_app') && appId) {
    return {
      current: false,
      console: {
        app_id: appId,
        app_role: state === 'tenant_app' ? 'tenant' : 'parent',
      },
    }
  }
  throw new Error(`${path} has an invalid retired App scope.`)
}

function migratedRoot(source, attachment) {
  const target = { ...source }
  delete target.app_scope_state
  delete target.app_scope_app_id
  if (attachment.console) target.console = attachment.console
  else delete target.console
  return target
}

const firebaseTarget = await resolveEcosystemFirebaseTarget(ecosystem)
if (firebaseTarget.projectId !== config.projectId) {
  throw new Error(`Configured ${ecosystem} project does not match the migration target.`)
}
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: config.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: config.projectId },
  `migrate-console-root-attachments-${ecosystem}-${Date.now()}`
)
const db = getFirestore(app, config.databaseId)
const sourceDocuments = []
const plannedDocuments = []
const counts = {}

for (const collectionName of config.collections) {
  const snapshot = await db.collection(collectionName).get()
  counts[collectionName] = { scanned: snapshot.size, changes: 0 }
  for (const document of snapshot.docs.sort((left, right) => left.id.localeCompare(right.id))) {
    const path = document.ref.path
    const source = document.data() || {}
    const attachment = readLegacyAttachment(path, source)
    if (attachment.current) continue
    if (attachment.console) {
      const support = await db.doc(
        `apps/${attachment.console.app_id}/${collectionName}/${document.id}`
      ).get()
      if (!support.exists) {
        throw new Error(`${path} has no same-id App support record.`)
      }
    }
    sourceDocuments.push({ path, data: source })
    plannedDocuments.push({ path, data: migratedRoot(source, attachment) })
    counts[collectionName].changes += 1
  }
}

const sourceSha256 = hash(sourceDocuments)
const plan = {
  format: 'fireux-console-root-attachments-plan/1',
  ecosystem,
  project_id: config.projectId,
  database_id: config.databaseId,
  source_sha256: sourceSha256,
  counts,
  document_count: plannedDocuments.length,
  targets: plannedDocuments.map(document => ({
    path: document.path,
    target_sha256: hash(document.data),
  })),
}
const planSha256 = hash(plan)

if (!apply) {
  console.log(JSON.stringify({
    mode: 'plan',
    plan_sha256: planSha256,
    confirmation,
    ...plan,
  }, null, 2))
  process.exit(0)
}

if (!plannedDocuments.length) {
  throw new Error('The approved plan contains no changes.')
}
if (text(args.confirm) !== confirmation) {
  throw new Error(`Apply requires --confirm ${confirmation}`)
}
if (text(args['confirm-plan']) !== planSha256) {
  throw new Error(`Apply requires --confirm-plan ${planSha256}`)
}
if (text(args['confirm-source']) !== sourceSha256) {
  throw new Error(`Apply requires --confirm-source ${sourceSha256}`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires a new /private/tmp JSON preimage path.')
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-console-root-attachments-preimage/1',
    captured_at: new Date().toISOString(),
    ecosystem,
    project_id: config.projectId,
    database_id: config.databaseId,
    source_sha256: sourceSha256,
    plan_sha256: planSha256,
    documents: sourceDocuments.map(document => ({
      path: document.path,
      exists: true,
      data: stable(document.data),
    })),
  },
})

const writes = plannedDocuments.map(document => {
  const [collectionPath, id] = document.path.split('/')
  return {
    target: defineFirestoreMutationTarget({
      key: `${ecosystem}.${collectionPath}.console-attachment`,
      lane: 'mcp-skill',
      verbs: ['update'],
      database: { kind: 'named', databaseId: config.databaseId },
      collectionPath,
    }),
    id,
    data: document.data,
  }
})

await mcpSkillAtomicSet(app, writes, async snapshots => {
  const current = snapshots.map(snapshot => ({
    path: snapshot.ref.path,
    data: snapshot.data() || {},
  }))
  if (hash(current) !== sourceSha256) {
    throw new Error('Root records changed after planning; review a fresh plan.')
  }
})

const readBack = await db.getAll(...plannedDocuments.map(document => db.doc(document.path)))
const verified = readBack.map(snapshot => ({
  path: snapshot.ref.path,
  data: snapshot.data() || {},
}))
if (hash(verified) !== hash(plannedDocuments)) {
  throw new Error(`Migration read-back failed. Protected preimage: ${backup.path}`)
}

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  ecosystem,
  project_id: config.projectId,
  database_id: config.databaseId,
  counts,
  document_count: plannedDocuments.length,
  source_sha256: sourceSha256,
  plan_sha256: planSha256,
  preimage: backup,
}, null, 2))
