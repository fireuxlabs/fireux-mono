#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:reconcile-place-entity-families'

const CANONICAL_SLUG_BY_KITCHEN_ID = new Map([
  ['ChIJ08WSgYSjj0cRD6oE3RwUFk0', 'la-tapberne'],
  ['ChIJ93_ggY-jj0cRTCyLcfBuK2w', 'luna-piccante'],
  ['ChIJE-GP3-Kjj0cRzAv0WviwcsY', 'baeren-ringgenberg'],
  ['bergwelt-grindelwald', 'bergwelt-grindelwald'],
])

const CREATE_PLACE_FROM_KITCHEN_IDS = new Set(['bergwelt-grindelwald'])
const SKIP_MISSING_PLACE_IDS = new Set()

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const appId = clean(args.app || args.appId || DEFAULT_APP_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)

if (args.help || args.h) {
  console.log(`
Reconcile Place entity-family projections from live Kitchen/Supplier records.

Place remains root location truth. Kitchen/Supplier records remain the source
of operational truth. Place.entity_families is a read/UI projection only.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/reconcile-place-console-families.mjs [--commit]

Options:
  --app <appId>                  App id. Defaults to misebox-app.
  --project <id>                 Firebase project id. Defaults to misebox-78f9c.
  --database <id>                Firestore database id. Defaults to misebox.
  --service-account <path>       Service account JSON path.
`)
  process.exit(0)
}

if (!projectId) throw new Error('Missing project id.')
if (!databaseId) throw new Error('Missing database id.')
if (!serviceAccountPath) throw new Error('Missing service account path.')

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `reconcile-place-console-families-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const report = {
  projectId,
  databaseId,
  appId,
  commit,
  places: {
    inspected: 0,
    changed: 0,
    created: 0,
    unchanged: 0,
  },
  kitchens: {
    inspected: 0,
    changed: 0,
    unchanged: 0,
    missingPlace: 0,
    skippedMissingPlace: 0,
  },
  suppliers: {
    inspected: 0,
    changed: 0,
    unchanged: 0,
  },
  entries: [],
}

const [placeSnap, kitchenSnap, supplierSnap] = await Promise.all([
  db.collection('places').get(),
  db.collection('kitchens').get(),
  db.collection('suppliers').get(),
])

const places = new Map(placeSnap.docs.map((doc) => [doc.id, doc.data() || {}]))
const placeRefs = new Map(placeSnap.docs.map((doc) => [doc.id, doc.ref]))
const linkedFamiliesByPlaceId = new Map()

function clean(value) {
  return String(value ?? '').trim()
}

function normalizeSlug(value) {
  return clean(value)
    .replace(/\u00c4/g, 'Ae')
    .replace(/\u00d6/g, 'Oe')
    .replace(/\u00dc/g, 'Ue')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: appId,
  }
}

function familyList(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(clean).filter(Boolean))].sort()
    : []
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined)
}

function sameList(a, b) {
  return a.length === b.length && a.every((entry, index) => entry === b[index])
}

function addFamily(placeId, family) {
  if (!placeId) return
  const existing = linkedFamiliesByPlaceId.get(placeId) || new Set()
  existing.add(family)
  linkedFamiliesByPlaceId.set(placeId, existing)
}

function resolveKitchenSlug(id, kitchen) {
  return normalizeSlug(
    CANONICAL_SLUG_BY_KITCHEN_ID.get(id) ||
      kitchen.slug ||
      kitchen.display_name ||
      kitchen.name ||
      id
  )
}

function placeCreatePayload(id, kitchen, slug) {
  const name = clean(kitchen.display_name || kitchen.name || id)
  return {
    id,
    name,
    short_name: clean(kitchen.short_name || name),
    brand_tagline: clean(kitchen.tagline || kitchen.description),
    about: clean(kitchen.description),
    formatted_address: clean(kitchen.formatted_address),
    short_address: clean(kitchen.short_address),
    address: {
      street: '',
      city: '',
      region: '',
      postal_code: '',
      country_code: '',
    },
    lat: Number(kitchen.lat || 0),
    lng: Number(kitchen.lng || 0),
    timezone: clean(kitchen.timezone),
    image_url: clean(kitchen.display_image_url || kitchen.image_url),
    cover_image: '',
    gallery_images: [],
    image_shade: 'none',
    phone: '',
    email: '',
    website: '',
    google_maps_url: '',
    social_links: {
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      linkedin: '',
      youtube: '',
    },
    place_type: 'physical',
    types: [],
    tags: [],
    price_level: '',
    default_currency_code: clean(kitchen.currency_code || 'CHF').toUpperCase(),
    claimed_by: '',
    verified: false,
    slug,
    entity_families: ['kitchen'],
    source: 'manual',
    search_term: normalizeSlug(`${name} ${kitchen.description || ''}`).replace(/-/g, ' '),
    created: stamp(),
    updated: stamp(),
  }
}

function tidyPlacePatch(id, place) {
  const patch = {}
  const createdAt = place.created_at || place.created?.at

  if (clean(place.id) !== id) patch.id = id
  if (place.short_name === undefined) patch.short_name = ''
  if (place.brand_tagline === undefined) patch.brand_tagline = ''
  if (place.about === undefined) patch.about = ''
  if (!Array.isArray(place.gallery_images)) patch.gallery_images = []
  if (!Array.isArray(place.types)) patch.types = []
  if (!Array.isArray(place.tags)) patch.tags = []
  if (!place.address || typeof place.address !== 'object' || Array.isArray(place.address)) {
    patch.address = {
      street: '',
      city: '',
      region: '',
      postal_code: '',
      country_code: '',
    }
  }
  if (!place.social_links || typeof place.social_links !== 'object' || Array.isArray(place.social_links)) {
    patch.social_links = {
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      linkedin: '',
      youtube: '',
    }
  }
  if (place.phone === undefined) patch.phone = ''
  if (place.email === undefined) patch.email = ''
  if (place.website === undefined) patch.website = ''
  if (place.google_maps_url === undefined) patch.google_maps_url = ''
  if (place.cover_image === undefined) patch.cover_image = ''
  if (place.timezone === undefined) patch.timezone = ''
  if (place.price_level === undefined) patch.price_level = ''
  if (place.default_currency_code === undefined) patch.default_currency_code = ''
  if (place.claimed_by === undefined) patch.claimed_by = ''
  if (place.verified === undefined || place.verified === null) patch.verified = false
  if (!clean(place.place_type)) patch.place_type = 'physical'
  if (!clean(place.source)) patch.source = 'fireux'
  if (!clean(place.image_shade)) patch.image_shade = 'none'
  if (place.created === undefined) {
    patch.created = {
      at: createdAt || FieldValue.serverTimestamp(),
      by: clean(place.creator_id) || SYSTEM_ACTOR,
    }
  }

  return patch
}

async function setDoc(ref, patch, options = { merge: true }) {
  if (!commit) return
  await ref.set(patch, options)
}

for (const doc of kitchenSnap.docs) {
  report.kitchens.inspected += 1
  const kitchen = doc.data() || {}
  const placeId = clean(kitchen.place_id) || doc.id
  const slug = resolveKitchenSlug(doc.id, kitchen)
  const patch = {}

  if (!places.has(placeId) && SKIP_MISSING_PLACE_IDS.has(doc.id)) {
    report.kitchens.skippedMissingPlace += 1
    report.entries.push({
      path: doc.ref.path,
      action: 'skipped-missing-place',
      reason: 'known smoke/test kitchen',
    })
    continue
  }

  if (clean(kitchen.place_id) !== placeId) patch.place_id = placeId
  if (clean(kitchen.slug) !== slug) patch.slug = slug

  if (Object.keys(patch).length) {
    report.kitchens.changed += 1
    report.entries.push({
      path: doc.ref.path,
      action: commit ? 'updated-kitchen' : 'would-update-kitchen',
      patch,
    })
    await setDoc(doc.ref, { ...patch, updated: stamp() })
  } else {
    report.kitchens.unchanged += 1
  }

  if (places.has(placeId)) {
    addFamily(placeId, 'kitchen')
    continue
  }

  if (!CREATE_PLACE_FROM_KITCHEN_IDS.has(doc.id)) {
    report.kitchens.missingPlace += 1
    report.entries.push({
      path: doc.ref.path,
      action: 'missing-place',
      placeId,
    })
    continue
  }

  const ref = db.collection('places').doc(placeId)
  const payload = placeCreatePayload(placeId, kitchen, slug)
  places.set(placeId, payload)
  placeRefs.set(placeId, ref)
  addFamily(placeId, 'kitchen')
  report.places.created += 1
  report.entries.push({
    path: ref.path,
    action: commit ? 'created-place' : 'would-create-place',
    name: payload.name,
    slug,
    entity_families: payload.entity_families,
  })
  await setDoc(ref, payload)
}

for (const doc of supplierSnap.docs) {
  report.suppliers.inspected += 1
  const supplier = doc.data() || {}
  const placeId = clean(supplier.place_id)

  if (!placeId) {
    report.suppliers.unchanged += 1
    continue
  }

  addFamily(placeId, 'supplier')
  report.suppliers.unchanged += 1
}

for (const [placeId, place] of places.entries()) {
  report.places.inspected += 1
  const ref = placeRefs.get(placeId) || db.collection('places').doc(placeId)
  const families = [...(linkedFamiliesByPlaceId.get(placeId) || new Set())].sort()
  const currentFamilies = familyList(firstDefined(place.entity_families, place.console_families))
  const desiredSlug = families.includes('kitchen')
    ? resolveKitchenSlug(
        placeId,
        kitchenSnap.docs.find((doc) => (clean(doc.data()?.place_id) || doc.id) === placeId)?.data() || {}
      )
    : clean(place.slug)
  const patch = {}

  if (
    !sameList(currentFamilies, families) ||
    (families.length > 0 && !Object.prototype.hasOwnProperty.call(place, 'entity_families'))
  ) {
    patch.entity_families = families
  }
  if (Object.prototype.hasOwnProperty.call(place, 'console_families')) {
    patch.console_families = FieldValue.delete()
  }
  if (desiredSlug && clean(place.slug) !== desiredSlug) patch.slug = desiredSlug
  if (families.includes('kitchen')) {
    Object.assign(patch, tidyPlacePatch(placeId, place))
  }

  if (!Object.keys(patch).length) {
    report.places.unchanged += 1
    continue
  }

  report.places.changed += 1
  report.entries.push({
    path: ref.path,
    action: commit ? 'updated-place' : 'would-update-place',
    before: {
      slug: clean(place.slug),
      entity_families: currentFamilies,
    },
    patch,
  })
  await setDoc(ref, { ...patch, updated: stamp() })
}

console.log(JSON.stringify(report, null, 2))
