#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: restore approved Place identity references removed by the bounded legacy-assets migration.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const PLACE_ID = '5dGJgdjDv7Zi0tjva61O'
const args = parseArgs(process.argv.slice(2))
const stable = value => value == null || typeof value !== 'object'
  ? value
  : Array.isArray(value)
    ? value.map(stable)
    : typeof value.toDate === 'function'
      ? { __timestamp: value.toDate().toISOString() }
      : Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stable(child)]))
const sha256 = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const text = value => String(value ?? '').trim()
const sourcePath = text(args.preimage)
if (!sourcePath.startsWith('/private/tmp/') || !sourcePath.endsWith('.json')) throw new Error('Use --preimage /private/tmp/<protected-preimage>.json')
const protectedPreimage = JSON.parse(await readFile(sourcePath, 'utf8'))
const source = protectedPreimage.documents?.find(item => item.path === `places/${PLACE_ID}`)?.data
const logoImage = text(source?.assets?.logo)
const wordmarkImage = text(source?.assets?.wordmark)
if (!logoImage || !wordmarkImage) throw new Error('The protected preimage does not contain both Friiites Place identity references.')

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `restore-misebox-place-identity-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const snapshot = await db.doc(`places/${PLACE_ID}`).get()
if (!snapshot.exists) throw new Error('Friiites Place does not exist.')
const current = snapshot.data() || {}
if ((text(current.logo_image) && text(current.logo_image) !== logoImage) ||
  (text(current.wordmark_image) && text(current.wordmark_image) !== wordmarkImage)) {
  throw new Error('Friiites Place identity references conflict with the protected preimage.')
}
for (const [label, url, expectedObject] of [
  ['logo', logoImage, `places/${PLACE_ID}/logo`],
  ['wordmark', wordmarkImage, `places/${PLACE_ID}/wordmark`],
]) {
  const parsed = new URL(url)
  const match = parsed.pathname.match(/^\/v0\/b\/([^/]+)\/o\/([^/]+)$/)
  if (!match || decodeURIComponent(match[2]) !== expectedObject) throw new Error(`${label} reference does not match ${expectedObject}.`)
  const [exists] = await getStorage(app).bucket(decodeURIComponent(match[1])).file(expectedObject).exists()
  if (!exists) throw new Error(`${label} Storage object is missing.`)
}
const patch = { logo_image: logoImage, wordmark_image: wordmarkImage, media_backdrop_color: '#0B0B0A' }
const plan = { format: 'fireux-misebox-place-identity-restore/1', project_id: PROJECT_ID, database_id: DATABASE_ID, path: `places/${PLACE_ID}`, source_sha256: sha256(current), patch }
const planSha256 = sha256(plan)
if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, plan }, null, 2))
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm ${planSha256}`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) throw new Error('Apply requires --backup /private/tmp/<name>.json')
const backup = await writeProtectedJsonArtifact({ path: backupPath, payload: { ...plan, captured_at: new Date().toISOString(), data: stable(current) } })
const latest = await db.doc(plan.path).get()
if (!latest.exists || sha256(latest.data()) !== plan.source_sha256) throw new Error('Friiites Place changed after planning.')
const target = defineFirestoreMutationTarget({ key: 'misebox.place-identity-restore', lane: 'mcp-skill', verbs: ['update'], database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath: 'places' })
await mcpSkillUpdate(app, target, PLACE_ID, patch)
const verified = (await db.doc(plan.path).get()).data() || {}
if (verified.logo_image !== logoImage || verified.wordmark_image !== wordmarkImage || verified.media_backdrop_color !== patch.media_backdrop_color) throw new Error(`Post-write verification failed. Backup: ${backup.path}`)
console.log(JSON.stringify({ mode: 'apply', ok: true, plan_sha256: planSha256, backup }, null, 2))
