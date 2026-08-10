#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: plan or explicitly migrate exact legacy Kitchen `mise` pairs into canonical AppKitchen `prep-items`.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const apply = args.apply === true
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `migrate-kitchen-prep-items-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const stable = value => {
  if (Array.isArray(value)) return value.map(stable)
  if (!value || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stable(entry)])
  )
}
const hash = value => createHash('sha256')
  .update(JSON.stringify(stable(value)))
  .digest('hex')
const isEmptyMap = value => value && typeof value === 'object' &&
  !Array.isArray(value) && Object.keys(value).length === 0
const isEmptyList = value => Array.isArray(value) && value.length === 0
const collectionPath = documentPath => documentPath.split('/').slice(0, -1).join('/')
const mutationTarget = (key, path, verbs) => defineFirestoreMutationTarget({
  key: `kitchen-prep-item-migration.${key}`,
  lane: 'mcp-skill',
  verbs,
  database: { kind: 'named', databaseId },
  collectionPath: path,
})

const expectedKeys = [
  'assignee_ids', 'category', 'checklist', 'completed_at', 'created',
  'description', 'descriptions', 'due_at', 'estimated_minutes', 'id',
  'ingredient_ids', 'kind', 'kitchen_id', 'menu_id', 'mise_ids', 'name',
  'names', 'notes', 'priority', 'recipe_id', 'service_date', 'slug',
  'source_language', 'station', 'status', 'title', 'type', 'updated',
].sort()

function assertLegacyPrepItem(data, path, documentId, kitchenId) {
  const keys = Object.keys(data).sort()
  const failures = []
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) failures.push('unexpected schema')
  if (text(data.id) !== documentId) failures.push('id/path mismatch')
  if (text(data.kitchen_id) !== kitchenId) failures.push('Kitchen/path mismatch')
  if (text(data.type) !== 'prep' || text(data.kind) !== 'prep' || text(data.category) !== 'prep') {
    failures.push('not classified as prep')
  }
  for (const field of ['assignee_ids', 'checklist', 'ingredient_ids', 'mise_ids']) {
    if (!isEmptyList(data[field])) failures.push(`${field} contains unmapped state`)
  }
  for (const field of ['completed_at', 'due_at']) {
    if (!isEmptyMap(data[field])) failures.push(`${field} contains task state`)
  }
  if (Number(data.estimated_minutes) !== 0) failures.push('estimated_minutes contains task state')
  for (const field of ['menu_id', 'notes', 'service_date']) {
    if (text(data[field])) failures.push(`${field} contains unmapped state`)
  }
  if (text(data.status) !== 'todo' || text(data.priority) !== 'normal') {
    failures.push('workflow state is not the inert legacy default')
  }
  if (!text(data.name) || !text(data.slug) || !text(data.source_language)) {
    failures.push('required Prep Item presentation is missing')
  }
  if (!data.names || typeof data.names !== 'object' || Array.isArray(data.names)) {
    failures.push('names is not a translation map')
  }
  if (!data.descriptions || typeof data.descriptions !== 'object' || Array.isArray(data.descriptions)) {
    failures.push('descriptions is not a translation map')
  }
  if (failures.length) throw new Error(`${path}: ${failures.join('; ')}`)
}

function toCanonicalPrepItem(data) {
  return {
    kitchen_id: text(data.kitchen_id),
    name: text(data.name),
    slug: text(data.slug),
    description: text(data.description),
    source_language: text(data.source_language),
    names: data.names,
    descriptions: data.descriptions,
    station: text(data.station),
    inputs: [],
    recipe_id: text(data.recipe_id),
    yield: { quantity: 0, unit: '' },
    method: [],
    created: data.created,
    updated: data.updated,
  }
}

const legacySnapshot = await db.collectionGroup('mise').get()
const rootByKey = new Map()
const appCopies = []
for (const document of legacySnapshot.docs) {
  const segments = document.ref.path.split('/')
  if (segments[0] === 'kitchens' && segments[2] === 'mise') {
    rootByKey.set(`${segments[1]}/${document.id}`, document)
  } else if (
    segments[0] === 'apps' && segments[2] === 'kitchens' && segments[4] === 'mise'
  ) {
    appCopies.push(document)
  } else {
    throw new Error(`Unknown legacy mise path: ${document.ref.path}`)
  }
}

const operations = []
for (const appDocument of appCopies.sort((left, right) => left.ref.path.localeCompare(right.ref.path))) {
  const segments = appDocument.ref.path.split('/')
  const appId = segments[1]
  const kitchenId = segments[3]
  const rootDocument = rootByKey.get(`${kitchenId}/${appDocument.id}`)
  if (!rootDocument) throw new Error(`Missing root copy for ${appDocument.ref.path}`)
  const source = appDocument.data() || {}
  const rootSource = rootDocument.data() || {}
  if (hash(source) !== hash(rootSource)) {
    throw new Error(`Legacy pair differs: ${rootDocument.ref.path} <> ${appDocument.ref.path}`)
  }
  assertLegacyPrepItem(source, appDocument.ref.path, appDocument.id, kitchenId)
  const targetPath = `apps/${appId}/kitchens/${kitchenId}/prep-items/${appDocument.id}`
  const targetSnapshot = await db.doc(targetPath).get()
  if (targetSnapshot.exists) throw new Error(`Canonical target already exists: ${targetPath}`)
  operations.push({
    id: appDocument.id,
    appId,
    kitchenId,
    rootPath: rootDocument.ref.path,
    appPath: appDocument.ref.path,
    targetPath,
    sourceSha256: hash(source),
    target: toCanonicalPrepItem(source),
  })
  rootByKey.delete(`${kitchenId}/${appDocument.id}`)
}
if (rootByKey.size) {
  throw new Error(`Found ${rootByKey.size} root legacy Prep Items without an AppKitchen pair`)
}

const plan = {
  format: 'fireux-misebox-kitchen-prep-items-plan/1',
  projectId: target.projectId || auth.projectId,
  databaseId,
  operations,
}
const planSha256 = hash(plan)
if (!apply) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2))
  process.exit(0)
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
  for (const path of [operation.rootPath, operation.appPath, operation.targetPath]) {
    const snapshot = await db.doc(path).get()
    documents.push({
      path,
      exists: snapshot.exists,
      data: snapshot.exists ? stable(snapshot.data()) : null,
    })
  }
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-kitchen-prep-items-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: target.projectId || auth.projectId,
    databaseId,
    documents,
  },
})

for (const operation of operations) {
  const [rootSnapshot, appSnapshot, targetSnapshot] = await Promise.all([
    db.doc(operation.rootPath).get(),
    db.doc(operation.appPath).get(),
    db.doc(operation.targetPath).get(),
  ])
  if (!rootSnapshot.exists || !appSnapshot.exists || targetSnapshot.exists) {
    throw new Error(`Migration precondition changed at ${operation.targetPath}`)
  }
  if (
    hash(rootSnapshot.data()) !== operation.sourceSha256 ||
    hash(appSnapshot.data()) !== operation.sourceSha256
  ) {
    throw new Error(`Migration source changed at ${operation.appPath}`)
  }

  await mcpSkillCreate(
    app,
    mutationTarget(operation.targetPath, collectionPath(operation.targetPath), ['create']),
    operation.id,
    operation.target
  )
  const created = await db.doc(operation.targetPath).get()
  if (!created.exists || hash(created.data()) !== hash(operation.target)) {
    throw new Error(`Canonical target verification failed at ${operation.targetPath}. Backup: ${backup.path}`)
  }

  const [freshRoot, freshApp] = await Promise.all([
    db.doc(operation.rootPath).get(),
    db.doc(operation.appPath).get(),
  ])
  if (
    !freshRoot.exists || !freshApp.exists ||
    hash(freshRoot.data()) !== operation.sourceSha256 ||
    hash(freshApp.data()) !== operation.sourceSha256
  ) {
    throw new Error(`Legacy source changed after canonical create at ${operation.appPath}. Backup: ${backup.path}`)
  }
  await mcpSkillDelete(
    app,
    mutationTarget(operation.appPath, collectionPath(operation.appPath), ['delete']),
    operation.id
  )
  await mcpSkillDelete(
    app,
    mutationTarget(operation.rootPath, collectionPath(operation.rootPath), ['delete']),
    operation.id
  )
}

for (const operation of operations) {
  const [rootSnapshot, appSnapshot, targetSnapshot] = await Promise.all([
    db.doc(operation.rootPath).get(),
    db.doc(operation.appPath).get(),
    db.doc(operation.targetPath).get(),
  ])
  if (rootSnapshot.exists || appSnapshot.exists || !targetSnapshot.exists) {
    throw new Error(`Post-migration verification failed at ${operation.targetPath}. Backup: ${backup.path}`)
  }
  if (hash(targetSnapshot.data()) !== hash(operation.target)) {
    throw new Error(`Canonical target differs at ${operation.targetPath}. Backup: ${backup.path}`)
  }
}

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  migrated: operations.length,
  deleted_legacy_documents: operations.length * 2,
  plan_sha256: planSha256,
  backup,
}, null, 2))
