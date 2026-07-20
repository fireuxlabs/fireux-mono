#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: sync approved Misebox downstream list/card snapshots through an explicit, backed-up operation.
// Concurrent edit — 2026-07-20 20:54 CEST — Repo Efficiency Pass 3 of 6: classify the explicit dry-run-first snapshot sync entrypoint.
// Concurrent edit — 2026-07-20 14:14 CEST — User identity boundary: stop materializing User identity in root or app profile rows.
// Concurrent edit — 2026-07-20 22:04 CEST — Place-root authority pass: stop copying Place truth onto Kitchen roots or inferring same-id links.
// Concurrent edit — 2026-07-20 22:10 CEST — Repo Efficiency Pass 4 of 6: add explicit target, protected preimage, atomic version checks, verification, and cleanup.

import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const OPERATION = 'sync-self-contained-collection-rows'
const MAX_ATOMIC_WRITES = 500
const ALLOWED_ARGS = new Set([
  'actor',
  'apply',
  'backup',
  'confirm',
  'database',
  'help',
  'project',
  'service-account',
  'summary',
])

const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
const isDeleteSentinel = (value) =>
  value?.constructor?.name === 'DeleteTransform'

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false
      if (isDeleteSentinel(entry)) return true
      if (typeof entry === 'string') return Boolean(entry.trim())
      if (Array.isArray(entry)) return entry.length > 0
      if (isPlainObject(entry)) return Object.keys(entry).length > 0
      return true
    })
  )
}

function normaliseForCompare(value) {
  if (isDeleteSentinel(value)) return { __firestore: 'delete' }
  if (value instanceof Timestamp) {
    return {
      __firestore: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Date) {
    return { __firestore: 'date', value: value.toISOString() }
  }
  if (Buffer.isBuffer(value)) {
    return { __firestore: 'bytes', base64: value.toString('base64') }
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { __firestore: 'number', value: String(value) }
  }
  if (Array.isArray(value)) return value.map(normaliseForCompare)
  if (value?.constructor?.name === 'DocumentReference') {
    return { __firestore: 'reference', path: value.path }
  }
  if (value?.constructor?.name === 'GeoPoint') {
    return {
      __firestore: 'geopoint',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }
  if (typeof value?.toBase64 === 'function') {
    return { __firestore: 'bytes', base64: value.toBase64() }
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normaliseForCompare(value[key])])
    )
  }
  return value
}

function serialiseFirestoreValue(value) {
  if (isDeleteSentinel(value)) return { __firestore_type: 'delete' }
  if (value instanceof Timestamp) {
    return {
      __firestore_type: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Date) {
    return { __firestore_type: 'date', value: value.toISOString() }
  }
  if (Buffer.isBuffer(value)) {
    return {
      __firestore_type: 'bytes',
      base64: value.toString('base64'),
    }
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { __firestore_type: 'number', value: String(value) }
  }
  if (Array.isArray(value)) return value.map(serialiseFirestoreValue)
  if (value?.constructor?.name === 'DocumentReference') {
    return { __firestore_type: 'reference', path: value.path }
  }
  if (value?.constructor?.name === 'GeoPoint') {
    return {
      __firestore_type: 'geopoint',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }
  if (typeof value?.toBase64 === 'function') {
    return { __firestore_type: 'bytes', base64: value.toBase64() }
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        serialiseFirestoreValue(entry),
      ])
    )
  }
  if (value && typeof value === 'object') {
    throw new Error(
      `Cannot create an exact JSON preimage for Firestore value ${value.constructor?.name || 'unknown'}.`
    )
  }
  return value
}

function currentShapeForPatch(currentValue, patchValue) {
  if (isDeleteSentinel(patchValue)) return undefined
  if (Array.isArray(patchValue) || !isPlainObject(patchValue)) {
    return currentValue
  }
  const currentRecord = record(currentValue)
  return Object.fromEntries(
    Object.keys(patchValue).map((key) => [
      key,
      currentShapeForPatch(currentRecord[key], patchValue[key]),
    ])
  )
}

function valuesEqual(left, right) {
  return (
    JSON.stringify(normaliseForCompare(left)) ===
    JSON.stringify(normaliseForCompare(right))
  )
}

function patchHasDelta(current, patch) {
  return Object.entries(patch).some(([key, patchValue]) => {
    if (isDeleteSentinel(patchValue)) {
      return Object.prototype.hasOwnProperty.call(record(current), key)
    }
    return !valuesEqual(
      currentShapeForPatch(record(current)[key], patchValue),
      patchValue
    )
  })
}

function versionLabel(value) {
  return value instanceof Timestamp
    ? `${value.seconds}.${String(value.nanoseconds).padStart(9, '0')}`
    : ''
}

function sameVersion(left, right) {
  return Boolean(
    left &&
      right &&
      (typeof left.isEqual === 'function'
        ? left.isEqual(right)
        : valuesEqual(left, right))
  )
}

function uniqueEntries(entries) {
  const byPath = new Map()
  for (const entry of entries.filter(Boolean)) byPath.set(entry.path, entry)
  return [...byPath.values()].sort((left, right) =>
    left.path.localeCompare(right.path)
  )
}

async function loadCollection(db, name) {
  const snapshot = await db.collection(name).get()
  return new Map(
    snapshot.docs.map((document) => {
      const data = document.data()
      const entry = {
        id: document.id,
        path: document.ref.path,
        ref: document.ref,
        data,
        updateTime: document.updateTime,
        effectiveData: { id: document.id, ...data },
        dependencies: [],
      }
      entry.dependencies = [entry]
      return [document.id, entry]
    })
  )
}

const kitchenPlaceCardSnapshot = (place) =>
  compactObject({
    name: text(place.name),
    brand_tagline: text(place.brand_tagline),
    short_address: text(place.short_address),
    formatted_address: text(place.formatted_address),
    image_url: text(place.image_url || place.cover_image),
    image_shade: text(place.image_shade),
  })

const placeSnapshot = (place) =>
  compactObject({
    name: text(place.name),
    short_name: text(place.short_name),
    brand_tagline: text(place.brand_tagline),
    short_address: text(place.short_address),
    formatted_address: text(place.formatted_address),
    lat: typeof place.lat === 'number' ? place.lat : undefined,
    lng: typeof place.lng === 'number' ? place.lng : undefined,
    image_url: text(place.image_url || place.cover_image),
    image_shade: text(place.image_shade),
    phone: text(place.phone),
    website: text(place.website),
  })

function kitchenName(kitchen) {
  const identity = record(kitchen.identity)
  return (
    text(identity.display_name) ||
    text(kitchen.display_name) ||
    text(kitchen.name) ||
    text(kitchen.short_name)
  )
}

function kitchenImage(kitchen) {
  const identity = record(kitchen.identity)
  return (
    text(identity.image_url) ||
    text(kitchen.display_image_url) ||
    text(kitchen.image_url)
  )
}

function kitchenImageShade(kitchen) {
  const identity = record(kitchen.identity)
  return text(identity.image_shade) || text(kitchen.image_shade)
}

function queuePatch({
  actor,
  dependencies,
  now,
  patch,
  patches,
  reason,
  target,
}) {
  const sourcePatch = compactObject(patch)
  if (!patchHasDelta(target.data, sourcePatch)) return

  patches.push({
    target,
    dependencies: uniqueEntries([target, ...dependencies]),
    reason,
    patch: compactObject({
      ...sourcePatch,
      updated: {
        ...record(sourcePatch.updated),
        at: now,
        by: actor,
      },
    }),
  })
}

async function buildPlan(db, actor) {
  const [places, kitchens, companies, jobs, menus] = await Promise.all([
    loadCollection(db, 'places'),
    loadCollection(db, 'kitchens'),
    loadCollection(db, 'companies'),
    loadCollection(db, 'jobs'),
    loadCollection(db, 'menus'),
  ])
  const now = Timestamp.now()
  const patches = []

  for (const kitchen of kitchens.values()) {
    const placeId = text(kitchen.effectiveData.place_id)
    const place = places.get(placeId)
    if (!place) {
      kitchens.delete(kitchen.id)
      continue
    }
    kitchen.effectiveData = {
      ...kitchen.effectiveData,
      ...kitchenPlaceCardSnapshot(place.effectiveData),
    }
    kitchen.dependencies = uniqueEntries([kitchen, place])
  }

  for (const company of companies.values()) {
    const place = places.get(company.id)
    if (!place) continue
    queuePatch({
      actor,
      dependencies: [place],
      now,
      patch: placeSnapshot(place.effectiveData),
      patches,
      reason: 'company place public card snapshot',
      target: company,
    })
  }

  for (const job of jobs.values()) {
    const workplaceType = text(job.effectiveData.workplace_type)
    const workplaceId = text(job.effectiveData.workplace_id)
    if (workplaceType !== 'kitchen' || !workplaceId) continue
    const kitchen = kitchens.get(workplaceId)
    if (!kitchen) continue
    queuePatch({
      actor,
      dependencies: kitchen.dependencies,
      now,
      patch: {
        workplace_label: kitchenName(kitchen.effectiveData),
        workplace_short_address: text(kitchen.effectiveData.short_address),
        workplace_formatted_address: text(
          kitchen.effectiveData.formatted_address
        ),
        workplace_image_url: kitchenImage(kitchen.effectiveData),
      },
      patches,
      reason: 'job workplace public card snapshot',
      target: job,
    })
  }

  for (const menu of menus.values()) {
    const source = record(menu.effectiveData.source)
    const kitchenId = text(source.kitchen_id)
    if (!kitchenId) continue
    const kitchen = kitchens.get(kitchenId)
    if (!kitchen) continue
    queuePatch({
      actor,
      dependencies: kitchen.dependencies,
      now,
      patch: {
        source: {
          kitchen_name: kitchenName(kitchen.effectiveData),
          kitchen_slug:
            text(kitchen.effectiveData.slug) || text(source.kitchen_slug),
        },
        image_url: kitchenImage(kitchen.effectiveData),
        image_shade: kitchenImageShade(kitchen.effectiveData),
      },
      patches,
      reason: 'menu kitchen public card snapshot',
      target: menu,
    })
  }

  return patches
}

function assertCurrentVersions(currentSnapshots, expectedEntries) {
  const currentByPath = new Map(
    currentSnapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  for (const expected of expectedEntries) {
    const current = currentByPath.get(expected.path)
    if (!current?.exists) {
      throw new Error(
        `Firestore document disappeared after planning: ${expected.path}`
      )
    }
    if (!sameVersion(current.updateTime, expected.updateTime)) {
      throw new Error(
        `Firestore document changed after planning: ${expected.path}. Re-run the dry-run and review a fresh plan.`
      )
    }
  }
}

function assertPatchApplied(current, patch, documentPath, prefix = '') {
  for (const [key, expected] of Object.entries(patch)) {
    const field = prefix ? `${prefix}.${key}` : key
    if (isDeleteSentinel(expected)) {
      if (Object.prototype.hasOwnProperty.call(record(current), key)) {
        throw new Error(
          `Verification failed: ${documentPath}.${field} still exists.`
        )
      }
      continue
    }
    const actual = record(current)[key]
    if (isPlainObject(expected)) {
      assertPatchApplied(actual, expected, documentPath, field)
      continue
    }
    if (!valuesEqual(actual, expected)) {
      throw new Error(`Verification failed: ${documentPath}.${field} differs.`)
    }
  }
}

async function writePreimageBackup({
  actor,
  backupPath,
  databaseId,
  patches,
  projectId,
}) {
  const resolvedPath = path.resolve(backupPath)
  await mkdir(path.dirname(resolvedPath), { recursive: true, mode: 0o700 })
  return writeProtectedJsonArtifact({
    path: resolvedPath,
    payload: {
      schema: 'fireux.firestore-preimage.v1',
      operation: OPERATION,
      createdAt: new Date().toISOString(),
      actor,
      target: { projectId, databaseId },
      documents: patches.map(({ dependencies, patch, reason, target }) => ({
        path: target.path,
        updateTime: versionLabel(target.updateTime),
        reason,
        before: serialiseFirestoreValue(target.data),
        plannedPatch: serialiseFirestoreValue(patch),
        dependencyVersions: dependencies.map((dependency) => ({
          path: dependency.path,
          updateTime: versionLabel(dependency.updateTime),
        })),
      })),
    },
  })
}

async function applyPlan(db, patches) {
  if (!patches.length) return 0

  const expectedEntries = uniqueEntries(
    patches.flatMap(({ dependencies }) => dependencies)
  )

  await db.runTransaction(async (transaction) => {
    const currentSnapshots = await transaction.getAll(
      ...expectedEntries.map((entry) => entry.ref)
    )
    assertCurrentVersions(currentSnapshots, expectedEntries)
    for (const { patch, target } of patches) {
      transaction.set(target.ref, patch, { merge: true })
    }
  })

  const written = await db.getAll(...patches.map(({ target }) => target.ref))
  for (let index = 0; index < patches.length; index += 1) {
    const snapshot = written[index]
    const planned = patches[index]
    if (!snapshot?.exists) {
      throw new Error(`Verification failed: ${planned.target.path} is missing.`)
    }
    assertPatchApplied(snapshot.data(), planned.patch, planned.target.path)
  }
  return written.length
}

function outputPatch({ patch, reason, target }) {
  return {
    path: target.path,
    reason,
    patch: serialiseFirestoreValue(patch),
  }
}

function textArg(args, key) {
  const value = args[key]
  if (value === undefined) return ''
  if (value === true) throw new Error(`--${key} requires a value.`)
  return String(value).trim()
}

function booleanFlag(args, key) {
  const value = args[key]
  if (value === undefined) return false
  if (value !== true) {
    throw new Error(`--${key} is a flag and does not accept a value.`)
  }
  return true
}

function validateArgs(args) {
  for (const key of Object.keys(args)) {
    if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option --${key}.`)
  }

  const projectId = textArg(args, 'project')
  const databaseId = textArg(args, 'database')
  const apply = booleanFlag(args, 'apply')
  const actor = textArg(args, 'actor') || `system:${OPERATION}`
  const backupPath = textArg(args, 'backup')
  const suppliedConfirmation = textArg(args, 'confirm')
  const summaryOnly = booleanFlag(args, 'summary')
  textArg(args, 'service-account')
  const confirmation = `${projectId}/${databaseId}`

  if (!projectId || !databaseId) {
    throw new Error(
      'Pass both --project <projectId> and --database <databaseId>.'
    )
  }
  if (apply) {
    if (suppliedConfirmation !== confirmation) {
      throw new Error(`Apply requires --confirm ${confirmation}.`)
    }
    if (!backupPath) {
      throw new Error('Apply requires --backup <new-json-path>.')
    }
  } else if (args.confirm !== undefined || args.backup !== undefined) {
    throw new Error('--confirm and --backup are only valid with --apply.')
  }

  return {
    actor,
    apply,
    backupPath,
    databaseId,
    projectId,
    summaryOnly,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help !== undefined) {
    booleanFlag(args, 'help')
    printUsage()
    return
  }

  const options = validateArgs(args)
  const auth = await resolveFirebaseAdminCredential({
    args,
    scope: 'fireux-misebox',
    projectId: options.projectId,
  })
  const app = initializeApp(
    { credential: auth.credential, projectId: options.projectId },
    OPERATION
  )

  try {
    const db = getFirestore(app, options.databaseId)
    const patches = await buildPlan(db, options.actor)
    const reasonCounts = patches.reduce((counts, patch) => {
      counts[patch.reason] = (counts[patch.reason] || 0) + 1
      return counts
    }, {})
    let backup = null
    let verified = 0

    if (options.apply && patches.length) {
      if (patches.length > MAX_ATOMIC_WRITES) {
        throw new Error(
          `Refusing ${patches.length} writes; the atomic limit is ${MAX_ATOMIC_WRITES}. Split this into a reviewed domain operation.`
        )
      }
      backup = await writePreimageBackup({
        actor: options.actor,
        backupPath: options.backupPath,
        databaseId: options.databaseId,
        patches,
        projectId: options.projectId,
      })
      console.log(`[backup] ${backup.path} sha256=${backup.sha256}`)
      verified = await applyPlan(db, patches)
    }

    const visiblePatches = options.summaryOnly ? patches.slice(0, 20) : patches
    console.log(
      JSON.stringify(
        {
          projectId: options.projectId,
          databaseId: options.databaseId,
          credentialSource: auth.source,
          mode: options.apply ? 'apply' : 'dry-run',
          patchCount: patches.length,
          reasonCounts,
          backup,
          verified,
          patches: visiblePatches.map(outputPatch),
          truncated:
            options.summaryOnly && patches.length > visiblePatches.length,
        },
        null,
        2
      )
    )
  } finally {
    await deleteApp(app)
  }
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  pnpm sync:misebox-public-card-snapshots -- --project <projectId> --database <databaseId> [--summary]',
      '  pnpm sync:misebox-public-card-snapshots -- --project <projectId> --database <databaseId> --apply --confirm <projectId>/<databaseId> --backup <new-json-path> [--actor <id>] [--summary]',
      '',
      'Dry-run is the default. Apply is one atomic transaction and fails when any contributing document changed after planning.',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
