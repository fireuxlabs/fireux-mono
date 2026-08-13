#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-11
// usage_note: plan or migrate legacy Place assets into the canonical sparse Place media fields after verifying every referenced Storage object.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const COLLECTION = 'places'
const ALLOWED_ASSET_KEYS = new Set(['image', 'cover', 'gallery', 'logo', 'wordmark'])
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = value => String(value ?? '').trim()
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = value => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stable(child)]))
}
const sha256 = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const firebaseReference = raw => {
  const value = text(raw)
  if (!value) return null
  let url
  try { url = new URL(value) } catch { throw new Error(`Invalid media URL: ${value}`) }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Media URL must be safe HTTPS: ${value}`)
  const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/([^/]+)$/)
  if (!match) throw new Error(`Media URL is not a Firebase Storage download URL: ${value}`)
  return { url: url.toString(), bucket: decodeURIComponent(match[1]), object: decodeURIComponent(match[2]) }
}

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `migrate-misebox-place-assets-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const snapshot = await db.collection(COLLECTION).get()
const matrix = []
for (const doc of snapshot.docs) {
  const data = doc.data() || {}
  const assets = record(data.assets)
  const keys = Object.keys(assets).sort()
  const unsupported = keys.filter(key => !ALLOWED_ASSET_KEYS.has(key))
  if (unsupported.length) throw new Error(`${doc.ref.path} has unsupported assets keys: ${unsupported.join(', ')}`)
  const patch = {}
  const references = []
  const unsupportedPlaceAssets = []
  const mapSingle = (legacyKey, canonicalKey) => {
    const reference = firebaseReference(assets[legacyKey])
    if (!reference) return
    const current = text(data[canonicalKey])
    if (current && current !== reference.url) throw new Error(`${doc.ref.path}.${canonicalKey} conflicts with assets.${legacyKey}`)
    patch[canonicalKey] = reference.url
    references.push({ legacy_field: `assets.${legacyKey}`, canonical_field: canonicalKey, ...reference })
  }
  mapSingle('image', 'image_url')
  mapSingle('cover', 'cover_image')
  if (assets.gallery !== undefined) {
    if (!Array.isArray(assets.gallery)) throw new Error(`${doc.ref.path}.assets.gallery must be a list`)
    const gallery = Array.from(new Set(assets.gallery.map(firebaseReference).filter(Boolean).map(item => item.url)))
    const current = Array.isArray(data.gallery_images) ? data.gallery_images.map(text).filter(Boolean) : []
    if (current.length && JSON.stringify(current) !== JSON.stringify(gallery)) throw new Error(`${doc.ref.path}.gallery_images conflicts with assets.gallery`)
    if (gallery.length) patch.gallery_images = gallery
    for (const raw of assets.gallery) {
      const reference = firebaseReference(raw)
      if (reference) references.push({ legacy_field: 'assets.gallery', canonical_field: 'gallery_images', ...reference })
    }
  }
  mapSingle('logo', 'logo_image')
  mapSingle('wordmark', 'wordmark_image')
  for (const [canonicalField, raw] of [
    ['image_url', data.image_url],
    ['cover_image', data.cover_image],
    ['logo_image', data.logo_image],
    ['wordmark_image', data.wordmark_image],
  ]) {
    const reference = firebaseReference(raw)
    if (reference) references.push({ legacy_field: null, canonical_field: canonicalField, ...reference })
  }
  for (const raw of Array.isArray(data.gallery_images) ? data.gallery_images : []) {
    const reference = firebaseReference(raw)
    if (reference) references.push({ legacy_field: null, canonical_field: 'gallery_images', ...reference })
  }
  const storage = []
  for (const reference of references.filter((item, index, list) =>
    list.findIndex(candidate => candidate.bucket === item.bucket && candidate.object === item.object) === index
  )) {
    if (!reference.object.startsWith(`places/${doc.id}/`)) throw new Error(`${doc.ref.path} references media outside its Place prefix: ${reference.object}`)
    const file = getStorage(app).bucket(reference.bucket).file(reference.object)
    const [exists] = await file.exists()
    if (!exists) throw new Error(`${doc.ref.path} references missing gs://${reference.bucket}/${reference.object}`)
    const [metadata] = await file.getMetadata()
    storage.push({ bucket: reference.bucket, object: reference.object, exists: true, generation: text(metadata.generation), content_type: text(metadata.contentType), size: text(metadata.size) })
  }
  matrix.push({
    id: doc.id,
    path: doc.ref.path,
    name: text(data.name),
    source_sha256: sha256(data),
    core_identity: { name: text(data.name), place_type: text(data.place_type), source: text(data.source) },
    authored_slug: text(data.slug) || null,
    locale_defaults: { default_currency_code: text(data.default_currency_code) || null, timezone: text(data.timezone) || null },
    media_backdrop_color: text(data.media_backdrop_color) || null,
    canonical_media_before: { image_url: text(data.image_url) || null, cover_image: text(data.cover_image) || null, gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images.map(text).filter(Boolean) : [], logo_image: text(data.logo_image) || null, wordmark_image: text(data.wordmark_image) || null },
    legacy_assets: keys.length ? stable(assets) : null,
    patch,
    delete_legacy_assets: keys.length > 0,
    unsupported_place_assets: unsupportedPlaceAssets,
    storage,
    action: keys.length ? 'update' : 'preserve',
  })
}
matrix.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
const operations = matrix.filter(row => row.action === 'update')
const plan = {
  format: 'fireux-misebox-place-assets-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  collection: COLLECTION,
  counts: {
    places: matrix.length,
    updates: operations.length,
    preserved: matrix.length - operations.length,
    image_url_patches: operations.filter(row => row.patch.image_url).length,
    cover_image_patches: operations.filter(row => row.patch.cover_image).length,
    gallery_image_patches: operations.filter(row => row.patch.gallery_images).reduce((count, row) => count + row.patch.gallery_images.length, 0),
    logo_image_patches: operations.filter(row => row.patch.logo_image).length,
    wordmark_image_patches: operations.filter(row => row.patch.wordmark_image).length,
    unsupported_place_asset_references: operations.reduce((count, row) => count + row.unsupported_place_assets.length, 0),
    verified_storage_objects: new Set(matrix.flatMap(row => row.storage.map(item => `${item.bucket}/${item.object}`))).size,
  },
  matrix,
}
const planSha256 = sha256(plan)
if (!apply) {
  const matrixPath = text(args.matrix)
  const artifact = matrixPath
    ? await writeProtectedJsonArtifact({ path: matrixPath, payload: { plan_sha256: planSha256, ...plan } })
    : null
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, counts: plan.counts, matrix_artifact: artifact }, null, 2))
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm ${planSha256}`)
const backupPath = text(args.backup)
if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) throw new Error('Apply requires --backup /private/tmp/<name>.json')
for (const operation of operations) {
  const current = await db.doc(operation.path).get()
  if (!current.exists || sha256(current.data()) !== operation.source_sha256) throw new Error(`${operation.path} changed after planning`)
}
const backup = await writeProtectedJsonArtifact({
  path: backupPath,
  payload: {
    format: 'fireux-misebox-place-assets-preimage/1',
    captured_at: new Date().toISOString(),
    plan_sha256: planSha256,
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    documents: operations.map(operation => ({ path: operation.path, data: stable(snapshot.docs.find(doc => doc.ref.path === operation.path)?.data() || {}) })),
  },
})
const target = defineFirestoreMutationTarget({ key: 'misebox.place-assets-migration', lane: 'mcp-skill', verbs: ['update'], database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath: COLLECTION })
for (const operation of operations) {
  await mcpSkillUpdate(app, target, operation.id, {
    ...operation.patch,
    assets: FieldValue.delete(),
    updated: { at: FieldValue.serverTimestamp(), by: 'system:migrate-misebox-place-assets' },
  })
}
for (const operation of operations) {
  const verified = await db.doc(operation.path).get()
  const data = verified.data() || {}
  if (!verified.exists || Object.hasOwn(data, 'assets')) throw new Error(`Post-write verification failed at ${operation.path}. Backup: ${backup.path}`)
  for (const [key, value] of Object.entries(operation.patch)) if (JSON.stringify(data[key]) !== JSON.stringify(value)) throw new Error(`Post-write verification failed for ${operation.path}.${key}. Backup: ${backup.path}`)
}
console.log(JSON.stringify({ mode: 'apply', ok: true, plan_sha256: planSha256, counts: plan.counts, backup }, null, 2))
