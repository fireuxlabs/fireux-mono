#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-30
// usage_note: sync denormalized list/card snapshots so collection rows are self-contained.

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(
  args['service-account'] ||
    'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
).trim()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || 'misebox').trim()
const commit = args.commit === true
const summaryOnly = args.summary === true
const actor = String(args.actor || 'system:sync-self-contained-collection-rows').trim()

const rawServiceAccount = await readFile(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawServiceAccount)
const projectId = explicitProjectId || String(serviceAccount.project_id || '').trim()

if (!projectId) {
  console.error('Could not resolve project id from --project or service account.')
  process.exit(1)
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})
const db = explicitDatabaseId
  ? getFirestore(app, explicitDatabaseId)
  : getFirestore(app)
const now = Timestamp.now()

const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const array = (value) => (Array.isArray(value) ? value : [])
const isFirestoreSentinel = (value) =>
  value && typeof value === 'object' && typeof value.isEqual === 'function'
const isDeleteSentinel = (value) =>
  isFirestoreSentinel(value) && value.constructor?.name === 'DeleteTransform'
const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false
      if (isFirestoreSentinel(entry)) return true
      if (typeof entry === 'string') return Boolean(entry.trim())
      if (Array.isArray(entry)) return entry.length > 0
      if (entry && typeof entry === 'object') return Object.keys(entry).length > 0
      return true
    })
  )

const userSnapshot = (user, id) =>
  compactObject({
    id,
    display_name: text(user.display_name),
    avatar: text(user.avatar),
    handle: text(user.handle),
  })

const kitchenPlaceCardSnapshot = (place) =>
  compactObject({
    name: text(place.name),
    brand_tagline: text(place.brand_tagline),
    short_address: text(place.short_address),
    formatted_address: text(place.formatted_address),
    image_url: text(place.image_url || place.cover_image),
    image_shade: text(place.image_shade),
  })

const kitchenPlaceCardSnapshotTrim = {
  short_name: FieldValue.delete(),
  lat: FieldValue.delete(),
  lng: FieldValue.delete(),
  phone: FieldValue.delete(),
  website: FieldValue.delete(),
  default_currency_code: FieldValue.delete(),
  source: FieldValue.delete(),
}

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
    default_currency_code: text(place.default_currency_code),
  })

const kitchenName = (kitchen) => {
  const identity = record(kitchen.identity)
  return (
    text(identity.display_name) ||
    text(kitchen.display_name) ||
    text(kitchen.name) ||
    text(kitchen.short_name)
  )
}

const kitchenImage = (kitchen) => {
  const identity = record(kitchen.identity)
  return text(identity.image_url) || text(kitchen.display_image_url) || text(kitchen.image_url)
}

const kitchenImageShade = (kitchen) => {
  const identity = record(kitchen.identity)
  return text(identity.image_shade) || text(kitchen.image_shade)
}

async function collectionById(name) {
  const snap = await db.collection(name).get()
  const map = new Map()
  for (const doc of snap.docs) {
    map.set(doc.id, { id: doc.id, ...doc.data() })
  }
  return map
}

async function listAppProfileDocs(collectionName) {
  const appsSnap = await db.collection('apps').get()
  const docs = []

  for (const appDoc of appsSnap.docs) {
    const profilesSnap = await appDoc.ref.collection(collectionName).get()
    for (const profileDoc of profilesSnap.docs) {
      docs.push({
        ref: profileDoc.ref,
        data: { id: profileDoc.id, ...profileDoc.data() },
      })
    }
  }

  return docs
}

const places = await collectionById('places')
const users = await collectionById('users')
const kitchens = await collectionById('kitchens')
const patches = []

const normaliseForCompare = (value) => {
  if (isFirestoreSentinel(value)) return `__FIRESTORE_${value.constructor?.name || 'SENTINEL'}__`
  if (Array.isArray(value)) return value.map(normaliseForCompare)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normaliseForCompare(value[key])])
    )
  }
  return value
}

const currentShapeForPatch = (currentValue, patchValue) => {
  if (isDeleteSentinel(patchValue)) return undefined
  if (Array.isArray(patchValue)) return currentValue
  if (patchValue && typeof patchValue === 'object') {
    const currentRecord = record(currentValue)
    return Object.fromEntries(
      Object.keys(patchValue).map((key) => [
        key,
        currentShapeForPatch(currentRecord[key], patchValue[key]),
      ])
    )
  }
  return currentValue
}

const patchHasDelta = (current, patch) =>
  Object.entries(patch).some(([key, patchValue]) => {
    if (isDeleteSentinel(patchValue)) {
      return Object.prototype.hasOwnProperty.call(record(current), key)
    }

    const currentValue = currentShapeForPatch(record(current)[key], patchValue)
    return JSON.stringify(normaliseForCompare(currentValue)) !==
      JSON.stringify(normaliseForCompare(patchValue))
  })

const serialiseForOutput = (value) => {
  if (isDeleteSentinel(value)) return '__DELETE_FIELD__'
  if (Array.isArray(value)) return value.map(serialiseForOutput)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialiseForOutput(entry)])
    )
  }
  return value
}

async function queuePatch(ref, current, patch, reason) {
  const sourcePatch = compactObject(patch)
  if (!patchHasDelta(current, sourcePatch)) return

  const cleanPatch = compactObject({
    ...sourcePatch,
    updated: {
      ...record(sourcePatch.updated),
      at: now,
      by: actor,
    },
  })

  patches.push({
    path: ref.path,
    reason,
    patch: serialiseForOutput(cleanPatch),
  })

  if (commit) {
    await ref.set(cleanPatch, { merge: true })
  }
}

async function syncKitchens() {
  const snap = await db.collection('kitchens').get()

  for (const doc of snap.docs) {
    const kitchen = { id: doc.id, ...doc.data() }
    const placeId = text(kitchen.place_id)
    const place = places.get(placeId) || places.get(doc.id)
    if (!place) continue

    const snapshot = kitchenPlaceCardSnapshot(place)
    kitchens.set(doc.id, {
      ...kitchen,
      ...snapshot,
    })

    await queuePatch(
      doc.ref,
      kitchen,
      {
        ...snapshot,
        ...kitchenPlaceCardSnapshotTrim,
      },
      'kitchen place public card snapshot'
    )
  }
}

async function syncCompanies() {
  const snap = await db.collection('companies').get()

  for (const doc of snap.docs) {
    const place = places.get(doc.id)
    if (!place) continue

    await queuePatch(
      doc.ref,
      { id: doc.id, ...doc.data() },
      {
        ...placeSnapshot(place),
      },
      'company place public card snapshot'
    )
  }
}

async function syncJobs() {
  const snap = await db.collection('jobs').get()

  for (const doc of snap.docs) {
    const job = { id: doc.id, ...doc.data() }
    const workplaceType = text(job.workplace_type)
    const workplaceId = text(job.workplace_id)
    if (workplaceType !== 'kitchen' || !workplaceId) continue

    const kitchen = kitchens.get(workplaceId)
    if (!kitchen) continue

    await queuePatch(
      doc.ref,
      job,
      {
        workplace_label: kitchenName(kitchen),
        workplace_short_address: text(kitchen.short_address),
        workplace_formatted_address: text(kitchen.formatted_address),
        workplace_image_url: kitchenImage(kitchen),
      },
      'job workplace public card snapshot'
    )
  }
}

async function syncMenus() {
  const snap = await db.collection('menus').get()

  for (const doc of snap.docs) {
    const menu = { id: doc.id, ...doc.data() }
    const source = record(menu.source)
    const kitchenId = text(source.kitchen_id)
    if (!kitchenId) continue

    const kitchen = kitchens.get(kitchenId)
    if (!kitchen) continue

    await queuePatch(
      doc.ref,
      menu,
      {
        source: {
          kitchen_name: kitchenName(kitchen),
          kitchen_slug: text(kitchen.slug) || text(source.kitchen_slug),
        },
        image_url: kitchenImage(kitchen),
        image_shade: kitchenImageShade(kitchen),
      },
      'menu kitchen public card snapshot'
    )
  }
}

async function syncProfileCollection(collectionName) {
  const rootSnap = await db.collection(collectionName).get()
  const docs = [
    ...rootSnap.docs.map((doc) => ({
      ref: doc.ref,
      data: { id: doc.id, ...doc.data() },
    })),
    ...(await listAppProfileDocs(collectionName)),
  ]

  for (const { ref, data } of docs) {
    const user = users.get(ref.id)
    if (!user) continue

    await queuePatch(
      ref,
      data,
      {
        user: userSnapshot(user, ref.id),
      },
      `${collectionName} public user summary snapshot`
    )
  }
}

await syncKitchens()
await syncCompanies()
await syncJobs()
await syncMenus()
for (const profileCollection of [
  'chefs',
  'customers',
  'drivers',
  'agents',
  'professionals',
]) {
  await syncProfileCollection(profileCollection)
}

const reasonCounts = patches.reduce((counts, patch) => {
  counts[patch.reason] = (counts[patch.reason] || 0) + 1
  return counts
}, {})

console.log(JSON.stringify({
  projectId,
  databaseId: explicitDatabaseId || '(default)',
  commit,
  patchCount: patches.length,
  reasonCounts,
  patches: summaryOnly ? patches.slice(0, 20) : patches,
  truncated: summaryOnly && patches.length > 20,
}, null, 2))
