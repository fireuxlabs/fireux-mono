#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-12
// usage_note: plan or apply the protected sparse Friiites App and Workspace palette migration.

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

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'friiites'
const KITCHEN_ID = '5dGJgdjDv7Zi0tjva61O'
const RESOLVED_APP_PALETTE = {
  canvas: '#181817',
  surface: '#242321',
  canvas_inverted: '#f3e9d2',
  text: '#f3e9d2',
  text_muted: '#bdb6a5',
  ink: '#181817',
  accent: '#d99a22',
  accent_contrast: '#181817',
}
const CONSOLE_PALETTE = {
  canvas: RESOLVED_APP_PALETTE.canvas,
  text: RESOLVED_APP_PALETTE.text,
  accent: RESOLVED_APP_PALETTE.accent,
  accent_contrast: RESOLVED_APP_PALETTE.accent_contrast,
}
const APP_PALETTE_LAYER = {
  surface: RESOLVED_APP_PALETTE.surface,
  canvas_inverted: RESOLVED_APP_PALETTE.canvas_inverted,
  text_muted: RESOLVED_APP_PALETTE.text_muted,
  ink: RESOLVED_APP_PALETTE.ink,
}

const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
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
  createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex')

const target = await resolveEcosystemFirebaseTarget('misebox')
if (target.projectId !== PROJECT_ID) {
  throw new Error(`Expected ${PROJECT_ID}; resolved ${target.projectId || 'no project'}.`)
}
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `migrate-friiites-palette-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const paths = {
  place: `places/${KITCHEN_ID}`,
  kitchen: `kitchens/${KITCHEN_ID}`,
  app: `apps/${APP_ID}`,
  support: `apps/${APP_ID}/kitchens/${KITCHEN_ID}`,
}
const snapshots = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => {
    const snapshot = await db.doc(path).get()
    return [key, snapshot]
  }))
)
for (const [key, snapshot] of Object.entries(snapshots)) {
  if (!snapshot.exists) throw new Error(`Required ${key} record is missing: ${snapshot.ref.path}`)
}

const place = snapshots.place.data() || {}
const kitchen = snapshots.kitchen.data() || {}
const canonicalApp = snapshots.app.data() || {}
const support = snapshots.support.data() || {}
const management = record(kitchen.management)
if (management.mode !== 'app' || text(management.app_id) !== APP_ID) {
  throw new Error('Friiites Kitchen is not attached to the Friiites App.')
}
const placeBackdropCandidates = {
  presentation: text(record(place.presentation).identity_backdrop_color).toLowerCase(),
  assets: text(record(place.assets).backdrop_color).toLowerCase(),
  media: text(place.media_backdrop_color).toLowerCase(),
  palette: text(record(place.brand_palette).primary_color).toLowerCase(),
}
const placeBackdrop =
  placeBackdropCandidates.presentation ||
  placeBackdropCandidates.assets ||
  placeBackdropCandidates.media ||
  placeBackdropCandidates.palette
if (!placeBackdrop) throw new Error('Friiites Place identity backdrop is missing.')
const kitchenOverride = text(
  record(kitchen.theme).identity_backdrop_color ||
  record(kitchen.assets).backdrop_color
)
const currentAppPalette = record(record(canonicalApp.theme).palette)
const currentWorkspacePalette = record(record(kitchen.theme).palette)
const acceptedAppPalettes = [RESOLVED_APP_PALETTE, APP_PALETTE_LAYER]
if (
  Object.keys(currentAppPalette).length &&
  !acceptedAppPalettes.some(palette => sha256(currentAppPalette) === sha256(palette))
) {
  throw new Error('App already has a different palette; refusing to overwrite it.')
}
if (
  Object.keys(currentWorkspacePalette).length &&
  sha256(currentWorkspacePalette) !== sha256(CONSOLE_PALETTE)
) {
  throw new Error('Workspace already has a different palette; refusing to overwrite it.')
}

const actorUid = text(
  record(support.created).by ||
  record(kitchen.created).by ||
  record(place.created).by ||
  record(canonicalApp.created).by
)
if (!actorUid) throw new Error('Unable to prove the Friiites creator/operator UID.')
const operatorIds = Array.isArray(support.operator_ids)
  ? support.operator_ids.map(text).filter(Boolean)
  : []
if (!operatorIds.includes(actorUid)) {
  throw new Error('The proven creator is not a Friiites Kitchen operator.')
}

const operations = [
  ...(!kitchenOverride || kitchenOverride !== placeBackdrop ? [] : [{
    key: 'kitchen',
    id: KITCHEN_ID,
    path: paths.kitchen,
    collectionPath: 'kitchens',
    sourceSha256: sha256(kitchen),
    removeIdentityBackdropOverride: true,
  }]),
  ...(sha256(currentAppPalette) === sha256(APP_PALETTE_LAYER) ? [] : [{
    key: 'app',
    id: APP_ID,
    path: paths.app,
    collectionPath: 'apps',
    sourceSha256: sha256(canonicalApp),
    patch: { 'theme.palette': APP_PALETTE_LAYER },
  }]),
  ...(sha256(currentWorkspacePalette) === sha256(CONSOLE_PALETTE) ? [] : [{
    key: 'kitchen-theme',
    id: KITCHEN_ID,
    path: paths.kitchen,
    collectionPath: 'kitchens',
    sourceSha256: sha256(kitchen),
    patch: { 'theme.palette': CONSOLE_PALETTE },
  }]),
]
const plan = {
  format: 'fireux-friiites-palette-plan/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  actorUid,
  placePath: paths.place,
  kitchenPath: paths.kitchen,
  inheritedIdentityBackdrop: placeBackdrop,
  kitchenIdentityBackdropOverride: kitchenOverride || null,
  resolvedAppPalette: RESOLVED_APP_PALETTE,
  workspacePalette: CONSOLE_PALETTE,
  appPaletteLayer: APP_PALETTE_LAYER,
  operations,
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
    format: 'fireux-friiites-palette-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: PROJECT_ID,
    databaseId: DATABASE_ID,
    documents,
  },
})

for (const operation of operations) {
  const mutationTarget = defineFirestoreMutationTarget({
    key: `friiites-palette.${operation.key}`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId: DATABASE_ID },
    collectionPath: operation.collectionPath,
  })
  await mcpSkillUpdate(app, mutationTarget, operation.id, {
    ...(operation.patch || {}),
    ...(operation.removeIdentityBackdropOverride
      ? { 'assets.backdrop_color': FieldValue.delete() }
      : {}),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: actorUid,
    },
  })
}

const [verifiedKitchen, verifiedApp] = await Promise.all([
  db.doc(paths.kitchen).get(),
  db.doc(paths.app).get(),
])
if (
  text(record(verifiedKitchen.data()?.assets).backdrop_color) ||
  sha256(record(record(verifiedApp.data()?.theme).palette)) !== sha256(APP_PALETTE_LAYER) ||
  sha256(record(record(verifiedKitchen.data()?.theme).palette)) !== sha256(CONSOLE_PALETTE)
) {
  throw new Error(`Post-migration verification failed. Protected preimage: ${backup.path}`)
}

console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  actorUid,
  updatedPaths: operations.map(operation => operation.path),
  resolvedAppPalette: RESOLVED_APP_PALETTE,
  appPaletteLayer: APP_PALETTE_LAYER,
  workspacePalette: CONSOLE_PALETTE,
  plan_sha256: planSha256,
  backup,
}, null, 2))
