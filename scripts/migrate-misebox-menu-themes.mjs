#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-14
// usage_note: plan or apply the protected Misebox Kitchen palette migration for proved public Menu fixtures.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const FIXTURES = [
  {
    key: 'interlaken-pizza',
    appId: 'misebox-app',
    kitchenId: 'ChIJWcym7tulj0cRb3N2twqVj1U',
    expectedPalette: {
      canvas: '#2B070A',
      text: '#F5F2EA',
      accent: '#FFA934',
      accent_contrast: '#0A0B0A',
    },
    palette: {
      canvas: '#f6f6f3',
      text: '#17201a',
      accent: '#004117',
      accent_contrast: '#ffffff',
    },
  },
  {
    key: 'la-tapberne',
    appId: 'la-tap-berne',
    kitchenId: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
    expectedPalette: {},
    expectedLegacyStyle: {
      background_color_light: '#F2E8D8',
      background_color_dark: '#171717',
      font_color_light: '#171717',
      font_color_dark: '#F7F1E6',
      title_color_dark: '#F7F1E6',
      title_color_light: '#171717',
    },
    palette: {
      canvas: '#171717',
      text: '#f7f1e6',
      accent: '#cfa85a',
      accent_contrast: '#171717',
    },
    removeLegacyStyle: true,
  },
  {
    key: 'friiites',
    appId: 'friiites',
    kitchenId: '5dGJgdjDv7Zi0tjva61O',
    expectedPalette: {
      canvas: '#181817',
      text: '#f3e9d2',
      accent: '#d99a22',
      accent_contrast: '#D99A22',
    },
    palette: {
      canvas: '#181817',
      text: '#f3e9d2',
      accent: '#d99a22',
      accent_contrast: '#181817',
    },
  },
]

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
const equal = (left, right) => sha256(left) === sha256(right)

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `migrate-misebox-menu-themes-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const operations = []

for (const fixture of FIXTURES) {
  const path = `kitchens/${fixture.kitchenId}`
  const snapshot = await db.doc(path).get()
  if (!snapshot.exists) throw new Error(`Missing Kitchen: ${path}`)
  const data = snapshot.data() || {}
  const currentPalette = record(record(data.theme).palette)
  const currentLegacyStyle = record(record(data.menus).style)
  const paletteReady = equal(currentPalette, fixture.palette)
  const legacyReady =
    !fixture.removeLegacyStyle || !Object.keys(currentLegacyStyle).length
  if (paletteReady && legacyReady) continue
  if (!paletteReady && !equal(currentPalette, fixture.expectedPalette)) {
    throw new Error(`${fixture.key} has an unexpected Workspace palette.`)
  }
  if (
    fixture.removeLegacyStyle &&
    Object.keys(currentLegacyStyle).length &&
    !equal(currentLegacyStyle, fixture.expectedLegacyStyle)
  ) {
    throw new Error(`${fixture.key} has an unexpected legacy Menu style.`)
  }
  const actorUid = text(record(data.updated).by || record(data.created).by)
  if (!actorUid) throw new Error(`${fixture.key} has no proven mutation actor.`)
  operations.push({
    ...fixture,
    path,
    collectionPath: 'kitchens',
    actorUid,
    sourceSha256: sha256(data),
  })
}

const plan = {
  format: 'fireux-misebox-menu-themes-plan/1',
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  operations: operations.map(
    ({ expectedPalette, expectedLegacyStyle, ...operation }) => operation
  ),
}
const planSha256 = sha256(plan)
if (!apply) {
  console.log(
    JSON.stringify({ mode: 'plan', plan_sha256: planSha256, ...plan }, null, 2)
  )
  process.exit(operations.length ? 2 : 0)
}
if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm ${planSha256}`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error(
    'Apply requires a new --backup /private/tmp/<name>.json path.'
  )
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
    data: stable(snapshot.data()),
  })
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-menu-themes-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256,
    projectId: PROJECT_ID,
    databaseId: DATABASE_ID,
    documents,
  },
})

for (const operation of operations) {
  const target = defineFirestoreMutationTarget({
    key: `misebox-menu-theme.${operation.key}`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId: DATABASE_ID },
    collectionPath: operation.collectionPath,
  })
  await mcpSkillUpdate(app, target, operation.kitchenId, {
    'theme.palette': operation.palette,
    ...(operation.removeLegacyStyle
      ? { 'menus.style': FieldValue.delete() }
      : {}),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: operation.actorUid,
    },
  })
}

for (const operation of operations) {
  const verified = await db.doc(operation.path).get()
  const data = verified.data() || {}
  const palette = record(record(data.theme).palette)
  const legacyStyle = record(record(data.menus).style)
  if (
    !verified.exists ||
    !equal(palette, operation.palette) ||
    (operation.removeLegacyStyle && Object.keys(legacyStyle).length)
  ) {
    throw new Error(
      `Post-migration verification failed at ${operation.path}. Backup: ${backup.path}`
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
      updatedPaths: operations.map((operation) => operation.path),
      backup,
    },
    null,
    2
  )
)
