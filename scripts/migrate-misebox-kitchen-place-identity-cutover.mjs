#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-29
// usage_note: plan or apply the protected same-id Place/Kitchen identity hard cutover in the named Misebox database.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const EXPECTED_KITCHENS = 18
const REJECTED_FIELDS = ['assets', 'brand_palette', 'identity', 'name', 'place_id']
const EXPORT_PREFIX = 'gs://misebox-78f9c-firestore-migrations/entity-canon-'
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, stable(child)]))
}
const sha256 = (value) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const equal = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right))
const missing = (value) =>
  value == null ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
const retainedExport = text(args['export-uri']).replace(/\/$/u, '')
if (!retainedExport.startsWith(EXPORT_PREFIX)) throw new Error('A verified retained Misebox entity-canon --export-uri is required.')

const auth = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `misebox-kitchen-place-cutover-${Date.now()}`)

try {
  const db = getFirestore(app, DATABASE_ID)
  const roots = await db.collection('kitchens').orderBy('__name__').get()
  const blockers = []
  if (roots.size !== EXPECTED_KITCHENS) blockers.push(`Expected ${EXPECTED_KITCHENS} Kitchen roots; found ${roots.size}.`)
  const operations = []
  for (const root of roots.docs) {
    const kitchen = root.data() || {}
    const placeSnapshot = await db.collection('places').doc(root.id).get()
    const place = placeSnapshot.exists ? placeSnapshot.data() || {} : null
    const identity = record(kitchen.identity)
    const assets = record(kitchen.assets)
    const palette = record(kitchen.brand_palette)
    const placePatch = {}
    const conflicts = []
    const propose = (field, candidate) => {
      if (missing(candidate)) return
      const current = place?.[field]
      if (missing(current)) placePatch[field] = candidate
      else if (!equal(current, candidate)) conflicts.push({ field, current: stable(current), legacy: stable(candidate) })
    }
    propose('name', text(kitchen.name) || text(identity.name))
    propose('tagline', text(identity.tagline))
    propose('image_url', text(assets.image))
    propose('logo_image', text(assets.logo))
    propose('wordmark_image', text(assets.wordmark))
    const backdrop = text(assets.backdrop_color)
    if (/^#[0-9a-f]{6}$/iu.test(backdrop)) propose('media_backdrop_color', backdrop.toUpperCase())
    if (Object.keys(palette).length) propose('brand_palette', palette)
    const families = Array.isArray(place?.entity_families)
      ? [...new Set(place.entity_families.map(text).filter(Boolean))]
      : []
    if (!families.includes('kitchen')) placePatch.entity_families = [...families, 'kitchen']

    let placeCreate = null
    if (!place) {
      const name = text(kitchen.name) || text(identity.name)
      if (!name) blockers.push(`Missing Place and recoverable name: places/${root.id}`)
      else {
        placeCreate = {
          name,
          slug: text(kitchen.slug) || root.id.toLowerCase(),
          place_type: 'non_physical',
          entity_families: ['kitchen'],
          ...(kitchen.created ? { created: stable(kitchen.created) } : {}),
          ...(kitchen.updated ? { updated: stable(kitchen.updated) } : {}),
        }
      }
    }
    const deleteFields = REJECTED_FIELDS.filter((field) => Object.hasOwn(kitchen, field))
    const kitchenAfter = { ...kitchen }
    for (const field of deleteFields) delete kitchenAfter[field]
    const resolvedPlace = placeCreate || { ...(place || {}), ...placePatch }
    if (!text(resolvedPlace.name)) blockers.push(`Place has no canonical name after plan: places/${root.id}`)
    if (!deleteFields.length && !placeCreate && !Object.keys(placePatch).length) continue
    operations.push({
      id: root.id,
      kitchen_sha256: sha256(kitchen),
      kitchen_after_sha256: sha256(kitchenAfter),
      place_exists: Boolean(place),
      place_sha256: place ? sha256(place) : null,
      place_after_sha256: sha256(resolvedPlace),
      place_create: placeCreate,
      place_patch: stable(placePatch),
      delete_fields: deleteFields,
      conflicts,
    })
  }
  const planBase = {
    format: 'fireux-misebox-kitchen-place-identity-cutover/1',
    project_id: PROJECT_ID,
    database_id: DATABASE_ID,
    retained_export: retainedExport,
    kitchen_roots: roots.size,
    operations,
    blockers,
  }
  const plan = { ...planBase, plan_sha256: sha256(planBase) }
  if (!apply) {
    const planPath = text(args.plan)
    if (!planPath.startsWith('/private/tmp/') || !planPath.endsWith('.json')) throw new Error('Dry-run requires --plan /private/tmp/<name>.json')
    const artifact = await writeProtectedJsonArtifact({ path: planPath, payload: plan })
    console.log(JSON.stringify({ mode: 'dry-run', plan_sha256: plan.plan_sha256, artifact, summary: {
      operations: operations.length,
      place_creates: operations.filter((item) => item.place_create).length,
      place_updates: operations.filter((item) => Object.keys(item.place_patch).length).length,
      kitchen_field_deletes: operations.reduce((sum, item) => sum + item.delete_fields.length, 0),
      conflicts: operations.reduce((sum, item) => sum + item.conflicts.length, 0),
      blockers: blockers.length,
    } }, null, 2))
    process.exitCode = blockers.length ? 2 : 0
  } else {
    const planPath = text(args.plan)
    const saved = JSON.parse(await readFile(planPath, 'utf8'))
    const savedHash = saved.plan_sha256
    const hashable = { ...saved }
    delete hashable.plan_sha256
    if (savedHash !== sha256(hashable) || savedHash !== text(args.confirm)) throw new Error('Apply requires the exact valid plan --confirm hash.')
    if (saved.blockers.length) throw new Error(`Cutover blocked: ${saved.blockers.join(' ')}`)
    const preimages = []
    for (const operation of saved.operations) {
      const [kitchen, place] = await Promise.all([db.collection('kitchens').doc(operation.id).get(), db.collection('places').doc(operation.id).get()])
      if (!kitchen.exists || sha256(kitchen.data()) !== operation.kitchen_sha256) throw new Error(`Kitchen changed after plan: ${operation.id}`)
      if (place.exists !== operation.place_exists || (place.exists && sha256(place.data()) !== operation.place_sha256)) throw new Error(`Place changed after plan: ${operation.id}`)
      preimages.push({ id: operation.id, kitchen: stable(kitchen.data()), place: place.exists ? stable(place.data()) : null })
    }
    const backupPath = text(args.backup)
    if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) throw new Error('Apply requires --backup /private/tmp/<name>.json')
    const backup = await writeProtectedJsonArtifact({ path: backupPath, payload: { format: 'fireux-misebox-kitchen-place-identity-preimage/1', captured_at: new Date().toISOString(), plan: saved, documents: preimages } })
    const placeTarget = defineFirestoreMutationTarget({ key: 'misebox.place-kitchen-identity-cutover.place', lane: 'mcp-skill', verbs: ['create', 'update'], database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath: 'places' })
    const kitchenTarget = defineFirestoreMutationTarget({ key: 'misebox.place-kitchen-identity-cutover.kitchen', lane: 'mcp-skill', verbs: ['update'], database: { kind: 'named', databaseId: DATABASE_ID }, collectionPath: 'kitchens' })
    for (const operation of saved.operations) {
      if (operation.place_create) await mcpSkillCreate(app, placeTarget, operation.id, operation.place_create)
      else if (Object.keys(operation.place_patch).length) await mcpSkillUpdate(app, placeTarget, operation.id, operation.place_patch)
      if (operation.delete_fields.length) await mcpSkillUpdate(app, kitchenTarget, operation.id, Object.fromEntries(operation.delete_fields.map((field) => [field, FieldValue.delete()])))
      const [kitchen, place] = await Promise.all([db.collection('kitchens').doc(operation.id).get(), db.collection('places').doc(operation.id).get()])
      if (!kitchen.exists || sha256(kitchen.data()) !== operation.kitchen_after_sha256 || !place.exists || sha256(place.data()) !== operation.place_after_sha256) throw new Error(`Exact post-write verification failed: ${operation.id}. Backup: ${backup.path}`)
    }
    console.log(JSON.stringify({ mode: 'applied-and-verified', plan_sha256: savedHash, operations: saved.operations.length, backup }, null, 2))
  }
} finally {
  await deleteApp(app)
}
