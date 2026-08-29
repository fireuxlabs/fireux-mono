#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-29
// usage_note: rename the canonical Misebox Place presentation field from brand_tagline to tagline.

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
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
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

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: auth.credential, projectId: PROJECT_ID },
  `migrate-misebox-place-taglines-${Date.now()}`
)
const db = getFirestore(app, DATABASE_ID)
const snapshot = await db.collection('places').get()
const rows = snapshot.docs.map((document) => {
  const data = document.data() || {}
  const hasLegacy = Object.hasOwn(data, 'brand_tagline')
  const hasCanonical = Object.hasOwn(data, 'tagline')
  const legacy = text(data.brand_tagline)
  const canonical = text(data.tagline)
  if (hasLegacy && hasCanonical && legacy !== canonical) {
    throw new Error(`Conflicting tagline fields at ${document.ref.path}.`)
  }
  return {
    id: document.id,
    path: document.ref.path,
    name: text(data.name),
    image_url: text(data.image_url),
    source_sha256: sha256(data),
    tagline: canonical || legacy,
    action: hasLegacy ? 'rename' : 'preserve',
  }
})
rows.sort(
  (left, right) =>
    left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
)
const operations = rows.filter((row) => row.action === 'rename')
const plan = {
  format: 'fireux-misebox-place-tagline-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  counts: {
    places: rows.length,
    renames: operations.length,
    preserved: rows.length - operations.length,
    missing_tagline: rows.filter((row) => !row.tagline).length,
    missing_image: rows.filter((row) => !row.image_url).length,
  },
  rows,
}
const planSha256 = sha256(plan)

if (!apply) {
  const details =
    args.details === true
      ? {
          missing_tagline: rows
            .filter((row) => !row.tagline)
            .map(({ id, name }) => ({ id, name })),
          missing_image: rows
            .filter((row) => !row.image_url)
            .map(({ id, name }) => ({ id, name })),
        }
      : {}
  console.log(
    JSON.stringify(
      {
        mode: 'plan',
        plan_sha256: planSha256,
        counts: plan.counts,
        ...details,
      },
      null,
      2
    )
  )
  process.exit(0)
}

if (text(args.confirm) !== planSha256) {
  throw new Error(`Apply requires --confirm ${planSha256}`)
}
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
  throw new Error('Apply requires --backup /private/tmp/<name>.json')
}
for (const operation of operations) {
  const current = await db.doc(operation.path).get()
  if (
    !current.exists ||
    sha256(current.data() || {}) !== operation.source_sha256
  ) {
    throw new Error(`${operation.path} changed after planning.`)
  }
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-place-tagline-preimage/1',
    captured_at: new Date().toISOString(),
    plan_sha256: planSha256,
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    documents: operations.map((operation) => ({
      path: operation.path,
      data: stable(
        snapshot.docs
          .find((document) => document.id === operation.id)
          ?.data() || {}
      ),
    })),
  },
})
const target = defineFirestoreMutationTarget({
  key: 'misebox.place-tagline-migration',
  lane: 'mcp-skill',
  verbs: ['update'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: 'places',
})
for (const operation of operations) {
  await mcpSkillUpdate(app, target, operation.id, {
    tagline: operation.tagline,
    brand_tagline: FieldValue.delete(),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: 'system:migrate-misebox-place-taglines',
    },
  })
}
for (const operation of operations) {
  const verified = await db.doc(operation.path).get()
  const data = verified.data() || {}
  if (
    !verified.exists ||
    Object.hasOwn(data, 'brand_tagline') ||
    text(data.tagline) !== operation.tagline
  ) {
    throw new Error(
      `Post-write verification failed at ${operation.path}. Backup: ${backup.path}`
    )
  }
}
console.log(
  JSON.stringify(
    {
      mode: 'apply',
      ok: true,
      plan_sha256: planSha256,
      counts: plan.counts,
      backup,
    },
    null,
    2
  )
)
