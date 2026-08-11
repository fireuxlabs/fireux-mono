#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or explicitly migrate Misebox Kitchen roots and AppKitchen Console configuration to the canonical split shape.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { resolveMcpSkillMutationRef } from './_lib/firestore-mutations/mcp-skill-common.mjs'
import { mcpSkillAtomicSet } from './_lib/firestore-mutations/mcp-skill-transaction.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const ECOSYSTEM = 'misebox'
const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const CONFIRMATION = 'MIGRATE_MISEBOX_KITCHEN_CONSOLE_SHAPE'
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true

const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const clone = value => {
  if (value == null || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return value
  if (Array.isArray(value)) return value.map(clone)
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, clone(child)])
  )
}
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
const exactKeys = (value, expected) => {
  const actual = Object.keys(record(value)).sort()
  const wanted = [...expected].sort()
  return actual.length === wanted.length &&
    actual.every((key, index) => key === wanted[index])
}
const stringArray = (value, label, limit) => {
  if (!Array.isArray(value) || value.length > limit) {
    throw new Error(`${label} must be a bounded array.`)
  }
  const items = value.map(text)
  if (items.some(item => !item) || new Set(items).size !== items.length) {
    throw new Error(`${label} contains invalid ids.`)
  }
  return items
}

function cleanRecord(value) {
  const source = record(value)
  return Object.fromEntries(
    Object.entries(source).filter(([, child]) => {
      if (child === undefined || child === null || child === '') return false
      if (Array.isArray(child)) return child.length > 0
      if (typeof child === 'object') return Object.keys(child).length > 0
      return true
    })
  )
}

function migrateIdentity(kitchenId, source) {
  const identity = record(source.identity)
  const wordmarkCandidates = [
    text(identity.wordmark_no_logo_image_url),
    text(identity.wordmark_image_url),
  ].filter(Boolean)
  if (new Set(wordmarkCandidates).size > 1) {
    throw new Error(`Kitchen ${kitchenId} has ambiguous wordmark assets.`)
  }
  return {
    identity: {
      name: text(identity.name || identity.display_name),
      tagline: text(identity.tagline),
    },
    assets: {
      image: text(identity.card_image_url || identity.image_url),
      logo: text(identity.logo_image_url),
      wordmark: wordmarkCandidates[0] || '',
      backdrop_color: text(identity.media_backdrop_color),
    },
  }
}

function splitMenuConfig(kitchenId, source, root) {
  const menus = clone(record(source.menus))
  const style = clone(record(menus.style))
  const existingPalette = cleanRecord(root.brand_palette)
  const stylePalette = cleanRecord({
    primary_color: style.primary_color,
    secondary_color: style.secondary_color,
  })
  for (const key of ['primary_color', 'secondary_color']) {
    if (existingPalette[key] && stylePalette[key] && existingPalette[key] !== stylePalette[key]) {
      throw new Error(`Kitchen ${kitchenId} has conflicting ${key} values.`)
    }
    delete style[key]
  }
  const palette = { ...stylePalette, ...existingPalette }
  if (Object.keys(palette).length) root.brand_palette = palette
  else delete root.brand_palette
  if (Object.keys(style).length) menus.style = style
  else delete menus.style
  return cleanRecord(menus)
}

function migrateRoot(kitchenId, source) {
  const root = clone(source)
  const scope = record(source.app_scope)
  if (
    !exactKeys(scope, ['state', 'app_id']) ||
    !['parent_app', 'tenant_app'].includes(scope.state) ||
    !text(scope.app_id)
  ) {
    throw new Error(`Kitchen ${kitchenId} has invalid App attachment.`)
  }
  const visibility = record(source.visibility)
  if (!exactKeys(visibility, ['show', 'active', 'is_test'])) {
    throw new Error(`Kitchen ${kitchenId} has unexpected visibility shape.`)
  }
  if (visibility.is_test !== false) {
    throw new Error(`Kitchen ${kitchenId} still represents a test subtype.`)
  }
  if (text(source.place_id) !== kitchenId) {
    throw new Error(`Kitchen ${kitchenId} does not share its Place id.`)
  }

  const presentation = migrateIdentity(kitchenId, source)
  root.status = ['active', 'paused', 'archived'].includes(source.status)
    ? source.status
    : visibility.active === false ? 'paused' : 'active'
  root.visibility = visibility.show === true
  root.identity = presentation.identity
  root.assets = presentation.assets
  root.console = {
    app_id: text(scope.app_id),
    app_role: scope.state === 'tenant_app' ? 'tenant' : 'parent',
  }

  const menus = splitMenuConfig(kitchenId, source, root)
  const consoleConfig = cleanRecord({
    menus,
    orders: cleanRecord(source.orders),
    tables: cleanRecord(source.tables),
    fulfilment: cleanRecord(source.fulfilment),
    integrations: cleanRecord({
      sproochli: cleanRecord(source.sproochli),
    }),
  })

  for (const key of [
    'app_scope',
    'app_scope_state',
    'app_scope_app_id',
    'app_id',
    'menus',
    'orders',
    'tables',
    'fulfilment',
    'sproochli',
    'is_test_kitchen',
  ]) delete root[key]

  return { root, consoleConfig, appId: root.console.app_id }
}

function migrateSupport(kitchenId, source, consoleConfig) {
  if (!exactKeys(source, [
    'operator_ids',
    'team_ids',
    'join_requests',
    'created',
    'updated',
  ])) {
    throw new Error(`AppKitchen ${kitchenId} has unexpected source keys.`)
  }
  stringArray(source.operator_ids, `AppKitchen ${kitchenId} operators`, 50)
  stringArray(source.team_ids, `AppKitchen ${kitchenId} team`, 100)
  stringArray(source.join_requests, `AppKitchen ${kitchenId} join requests`, 100)
  return { ...clone(source), console: consoleConfig }
}

const firebaseTarget = await resolveEcosystemFirebaseTarget(ECOSYSTEM)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ECOSYSTEM,
  projectId: firebaseTarget.projectId,
})
const projectId = firebaseTarget.projectId || auth.projectId
if (projectId !== PROJECT_ID) throw new Error(`Unexpected project: ${projectId}`)
const app = initializeApp(
  { credential: auth.credential, projectId },
  `migrate-kitchen-console-shape-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)

const [kitchens, places, apps] = await Promise.all([
  db.collection('kitchens').get(),
  db.collection('places').get(),
  db.collection('apps').get(),
])
const placeIds = new Set(places.docs.map(document => document.id))
const appIds = new Set(apps.docs.map(document => document.id))
const sourceDocuments = []
const plannedDocuments = []

for (const document of kitchens.docs.sort((left, right) => left.id.localeCompare(right.id))) {
  const sourceRoot = document.data() || {}
  if (!placeIds.has(document.id)) throw new Error(`Kitchen ${document.id} has no same-id Place.`)
  const migrated = migrateRoot(document.id, sourceRoot)
  if (!appIds.has(migrated.appId)) throw new Error(`Kitchen ${document.id} has no attached App.`)
  const supportRef = db.doc(`apps/${migrated.appId}/kitchens/${document.id}`)
  const support = await supportRef.get()
  if (!support.exists) throw new Error(`Kitchen ${document.id} has no same-id AppKitchen.`)
  const sourceSupport = support.data() || {}
  const targetSupport = migrateSupport(document.id, sourceSupport, migrated.consoleConfig)
  sourceDocuments.push(
    { path: document.ref.path, data: sourceRoot },
    { path: supportRef.path, data: sourceSupport },
  )
  plannedDocuments.push(
    { path: document.ref.path, data: migrated.root },
    { path: supportRef.path, data: targetSupport },
  )
}

const sourceSha256 = hash(sourceDocuments)
const plan = {
  format: 'fireux-misebox-kitchen-console-shape-plan/1',
  project_id: projectId,
  database_id: DATABASE_ID,
  source_sha256: sourceSha256,
  kitchen_count: kitchens.size,
  document_count: plannedDocuments.length,
  targets: plannedDocuments.map(document => ({
    path: document.path,
    target_sha256: hash(document.data),
  })),
}
const planSha256 = hash(plan)

if (!apply) {
  const output = JSON.stringify({
    mode: 'plan',
    plan_sha256: planSha256,
    confirmation: CONFIRMATION,
    ...plan,
  }, null, 2)
  await new Promise(resolve => process.stdout.write(`${output}\n`, resolve))
  process.exit(0)
}

if (text(args.confirm) !== CONFIRMATION) {
  throw new Error(`Apply requires --confirm ${CONFIRMATION}`)
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
    format: 'fireux-misebox-kitchen-console-shape-preimage/1',
    captured_at: new Date().toISOString(),
    project_id: projectId,
    database_id: DATABASE_ID,
    source_sha256: sourceSha256,
    plan_sha256: planSha256,
    documents: sourceDocuments.map(document => ({
      path: document.path,
      exists: true,
      data: stable(document.data),
    })),
  },
})

const rootTarget = defineFirestoreMutationTarget({
  key: 'misebox-kitchen-console-shape.kitchens',
  lane: 'mcp-skill',
  verbs: ['update'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: 'kitchens',
})
const refs = plannedDocuments.map((document) => {
  const segments = document.path.split('/')
  const target = segments.length === 2
    ? rootTarget
    : defineFirestoreMutationTarget({
        key: 'misebox-kitchen-console-shape.app-kitchens',
        lane: 'mcp-skill',
        verbs: ['update'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: segments.slice(0, -1).join('/'),
      })
  return {
    document,
    ref: resolveMcpSkillMutationRef(app, target, 'update', segments.at(-1)),
  }
})

await mcpSkillAtomicSet(app, refs.map(({ document }) => {
  const segments = document.path.split('/')
  return {
    target: segments.length === 2
      ? rootTarget
      : defineFirestoreMutationTarget({
          key: 'misebox-kitchen-console-shape.app-kitchens',
          lane: 'mcp-skill',
          verbs: ['update'],
          database: { kind: 'named', databaseId: DATABASE_ID },
          collectionPath: segments.slice(0, -1).join('/'),
        }),
    id: segments.at(-1),
    data: document.data,
  }
}), async current => {
  const currentDocuments = current.map(snapshot => ({
    path: snapshot.ref.path,
    data: snapshot.data() || {},
  }))
  if (hash(currentDocuments) !== sourceSha256) {
    throw new Error('Kitchen records changed after planning; review a fresh plan.')
  }
})

const readBack = await db.getAll(...refs.map(item => item.ref))
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
  project_id: projectId,
  database_id: DATABASE_ID,
  kitchen_count: kitchens.size,
  document_count: plannedDocuments.length,
  source_sha256: sourceSha256,
  plan_sha256: planSha256,
  preimage: backup,
}, null, 2))
