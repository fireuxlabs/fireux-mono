#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_ROOT_KITCHEN_COLLECTION = 'kitchens'
const DEFAULT_TARGET_APP_ID = 'misebox-app'
const PLACE_COLLECTION = 'places'
const SYSTEM_ACTOR = 'system:migrate-kitchen-place-identity-layer'

const clean = (value) => String(value ?? '').trim()
const key = (value) => clean(value).toLowerCase()
const unique = (values) => [...new Set(values.map(clean).filter(Boolean))]

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const clearConflicts = Boolean(args['clear-conflicts'] || args.clearConflicts)
const projectId = clean(args.project || DEFAULT_PROJECT_ID)
const databaseId = clean(args.database || DEFAULT_DATABASE_ID)
const serviceAccountPath = clean(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
)
const rootKitchenCollection = clean(
  args['root-kitchen-collection'] || DEFAULT_ROOT_KITCHEN_COLLECTION
)
const targetAppId = clean(args['target-app'] || args.targetApp || DEFAULT_TARGET_APP_ID)
const kitchenIdFilter = clean(args['kitchen-id'] || args.kitchenId)

if (args.help || args.h) {
  console.log(`
Migrate Kitchen identity overrides into linked Place truth.

When a Kitchen is linked to a Place, Place owns public business/location identity:
  name, image_url

Kitchen owns food/menu presentation:
  tagline, food_gallery, menu settings, children

This script sets explicit Kitchen place_id when an existing implicit doc-id
Place link is found. It also clears Kitchen display_name/display_image_url
when they duplicate or can be copied into the linked Place. Conflicts are
reported, not changed, unless --clear-conflicts is passed.

Kitchens without a linked Place are valid standalone/mobile candidates and are
reported without changing their Kitchen-native identity.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/migrate-kitchen-place-identity-layer.mjs
  node scripts/migrations/migrate-kitchen-place-identity-layer.mjs --commit

Options:
  --target-app <appId>              Also scan apps/{appId}/kitchens. Defaults to misebox-app.
  --kitchen-id <kitchenId>          Optional single kitchen id.
  --clear-conflicts                 Clear differing Kitchen values too.
  --project <id>                    Firebase project id. Defaults to misebox-78f9c.
  --database <id>                   Firestore database id. Defaults to misebox.
  --service-account <path>          Service account JSON path.
  --root-kitchen-collection <path>  Root Kitchen collection. Defaults to kitchens.
`)
  process.exit(0)
}

if (!projectId) throw new Error('Missing project id.')
if (!databaseId) throw new Error('Missing database id.')
if (!serviceAccountPath) throw new Error('Missing service account path.')
if (!rootKitchenCollection) throw new Error('Missing root Kitchen collection path.')

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `migrate-kitchen-place-identity-layer-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const report = {
  projectId,
  databaseId,
  rootKitchenCollection,
  targetAppId,
  kitchenId: kitchenIdFilter || '(all)',
  commit,
  clearConflicts,
  inspected: 0,
  changedKitchens: 0,
  changedPlaces: 0,
  unchanged: 0,
  missingKitchens: 0,
  missingPlaces: 0,
  unlinkedKitchens: 0,
  conflicts: 0,
  entries: [],
}

function hasExplicitPlaceLink(data) {
  return Boolean(clean(data.place_id || data.placeId))
}

async function findPlace(kitchenId, data) {
  const candidates = unique([data.place_id, data.placeId, data.id, kitchenId])

  for (const candidate of candidates) {
    const ref = db.collection(PLACE_COLLECTION).doc(candidate)
    const snap = await ref.get()
    if (snap.exists) return { ref, snap, via: 'id' }
  }

  const slug = clean(data.slug)
  if (!slug) return null

  const bySlug = await db
    .collection(PLACE_COLLECTION)
    .where('slug', '==', slug)
    .limit(1)
    .get()

  const match = bySlug.docs[0]
  return match ? { ref: match.ref, snap: match, via: 'slug' } : null
}

function resolveActions(kitchenData, placeData) {
  const kitchenName = clean(kitchenData.display_name)
  const kitchenImage = clean(kitchenData.display_image_url)
  const placeName = clean(placeData.name)
  const placeImage = clean(placeData.image_url)

  const kitchenPatch = {}
  const placePatch = {}
  const actions = []
  const conflicts = []

  if (kitchenName) {
    if (!placeName) {
      placePatch.name = kitchenName
      kitchenPatch.display_name = ''
      actions.push('copy-name-to-place')
      actions.push('clear-kitchen-display-name')
    } else if (key(kitchenName) === key(placeName)) {
      kitchenPatch.display_name = ''
      actions.push('clear-kitchen-display-name')
    } else if (clearConflicts) {
      kitchenPatch.display_name = ''
      actions.push('clear-conflicting-kitchen-display-name')
    } else {
      conflicts.push({
        field: 'display_name',
        kitchen: kitchenName,
        place: placeName,
      })
    }
  }

  if (kitchenImage) {
    if (!placeImage) {
      placePatch.image_url = kitchenImage
      kitchenPatch.display_image_url = ''
      actions.push('copy-image-to-place')
      actions.push('clear-kitchen-display-image')
    } else if (kitchenImage === placeImage) {
      kitchenPatch.display_image_url = ''
      actions.push('clear-kitchen-display-image')
    } else if (clearConflicts) {
      kitchenPatch.display_image_url = ''
      actions.push('clear-conflicting-kitchen-display-image')
    } else {
      conflicts.push({
        field: 'display_image_url',
        kitchen: kitchenImage,
        place: placeImage,
      })
    }
  }

  return { kitchenPatch, placePatch, actions, conflicts }
}

function addExplicitPlaceLink(kitchenData, place, kitchenPatch, actions) {
  if (hasExplicitPlaceLink(kitchenData)) return
  if (place.via !== 'id') return

  kitchenPatch.place_id = place.snap.id
  actions.push('set-kitchen-place-id')
}

function placeLikePreview(data) {
  return {
    name: clean(data.display_name || data.name),
    slug: clean(data.slug),
    place_id: clean(data.place_id),
    short_address: clean(data.short_address),
    formatted_address: clean(data.formatted_address),
    image_url: clean(data.display_image_url || data.image_url),
  }
}

async function inspectKitchen(ref) {
  const snap = await ref.get()

  if (!snap.exists) {
    report.missingKitchens += 1
    report.entries.push({ path: ref.path, action: 'missing-kitchen' })
    return
  }

  report.inspected += 1
  const data = snap.data() || {}
  const hasKitchenIdentity =
    Boolean(clean(data.display_name)) || Boolean(clean(data.display_image_url))

  const place = await findPlace(snap.id, data)
  if (!place) {
    if (!hasKitchenIdentity) {
      report.unchanged += 1
      return
    }

    const action = hasExplicitPlaceLink(data)
      ? 'missing-linked-place'
      : 'no-linked-place'

    if (action === 'missing-linked-place') {
      report.missingPlaces += 1
    } else {
      report.unlinkedKitchens += 1
    }

    report.entries.push({
      path: ref.path,
      id: snap.id,
      action,
      display_name: clean(data.display_name),
      display_image_url: clean(data.display_image_url),
      placeLikePreview: placeLikePreview(data),
    })
    return
  }

  const placeData = place.snap.data() || {}
  const { kitchenPatch, placePatch, actions, conflicts } = resolveActions(
    data,
    placeData
  )
  addExplicitPlaceLink(data, place, kitchenPatch, actions)

  const hasKitchenPatch = Object.keys(kitchenPatch).length > 0
  const hasPlacePatch = Object.keys(placePatch).length > 0

  if (conflicts.length) report.conflicts += conflicts.length

  if (!hasKitchenPatch && !hasPlacePatch) {
    report.unchanged += 1
    report.entries.push({
      path: ref.path,
      id: snap.id,
      placePath: place.ref.path,
      placeMatch: place.via,
      action: conflicts.length ? 'conflict' : 'unchanged',
      conflicts,
    })
    return
  }

  report.changedKitchens += hasKitchenPatch ? 1 : 0
  report.changedPlaces += hasPlacePatch ? 1 : 0
  report.entries.push({
    path: ref.path,
    id: snap.id,
    placePath: place.ref.path,
    placeMatch: place.via,
    actions,
    conflicts,
    kitchenPatch,
    placePatch,
  })

  if (!commit) return

  if (hasPlacePatch) {
    await place.ref.set(
      {
        ...placePatch,
        updated: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
        },
      },
      { merge: true }
    )
  }

  if (hasKitchenPatch) {
    await ref.set(
      {
        ...kitchenPatch,
        updated: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
        },
      },
      { merge: true }
    )
  }
}

const rootKitchenRefs = kitchenIdFilter
  ? [db.collection(rootKitchenCollection).doc(kitchenIdFilter)]
  : (await db.collection(rootKitchenCollection).get()).docs.map((doc) => doc.ref)

for (const ref of rootKitchenRefs) {
  await inspectKitchen(ref)
}

if (targetAppId) {
  const appKitchenCollection = db.doc(`apps/${targetAppId}`).collection('kitchens')
  const appKitchenRefs = kitchenIdFilter
    ? [appKitchenCollection.doc(kitchenIdFilter)]
    : (await appKitchenCollection.get()).docs.map((doc) => doc.ref)

  for (const ref of appKitchenRefs) {
    await inspectKitchen(ref)
  }
}

console.log(JSON.stringify(report, null, 2))
