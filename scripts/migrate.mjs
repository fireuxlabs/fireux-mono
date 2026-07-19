#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-19
// usage_note: retired legacy App, Ecosystem, and public User shape recipes; no migration was run.
/*
  Firestore migration runner (generic)

  Usage:
    node scripts/migrate.mjs --service-account <path> --project <projectId> --recipe <name> [--database <databaseId>] [--commit] [--app <appId>] [--limit N] [--pageSize N]
    node scripts/migrate.mjs --project <projectId> --recipe apply-drift-payload [--commit] [--payload <json> | --payloadFile <path>]

  Auth (one required):
    - --service-account <path>
    - Scoped or global Firebase credential env
    - Google Application Default Credentials
*/

import { initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

function asString(value, fallback = '') {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null
const targetAppId = typeof args.app === 'string' ? args.app : null
const recipe = typeof args.recipe === 'string' ? args.recipe : null
const databaseId = typeof args.database === 'string' ? args.database.trim() : ''
const payloadArg = typeof args.payload === 'string' ? args.payload : null
const payloadFile = typeof args.payloadFile === 'string' ? args.payloadFile : null
const retiredRecipes = new Set([
  'apps-canonical-shape',
  'ecosystem-project-id-fix',
  'users-canonical-shape',
])

if (help) {
  console.log(`\nFirestore migration runner\n`)
  console.log('Usage:')
  console.log('  node scripts/migrate.mjs --service-account <path> --project <projectId> --recipe <name> [--database <databaseId>] [--commit] [--app <appId>] [--limit N] [--pageSize N]')
  console.log('  node scripts/migrate.mjs --project <projectId> --recipe apply-drift-payload [--commit] [--payload <json> | --payloadFile <path>]')
  console.log('\nRecipes:')
  console.log('  - app-media-flatten')
  console.log('  - app-social-links-normalize')
  console.log('  - apps-content-cleanup')
  console.log('  - jobs-backfill-id')
  console.log('  - places-normalize-image-shade')
  console.log('  - places-migrate-image-url')
  console.log('  - places-backfill-short-address')
  console.log('  - places-backfill-short-name')
  console.log('  - places-backfill-place-type')
  console.log('  - app-users-canonical-shape')
  console.log('  - app-user-mirrors-rebuild')
  console.log('  - profile-app-overlays-backfill')
  console.log('  - console-entity-teams')
  console.log('  - console-entity-operators')
  console.log('  - console-targets-rebuild')
  console.log('  - kitchen-storage-normalize')
  console.log('  - users-delete-root')
  console.log('  - ingredients-canonical-shape')
  console.log('  - ingredients-normalize-id-shape')
  console.log('  - ingredients-assign-images')
  console.log('  - ingredients-upsert-payload')
  console.log('  - apply-drift-payload')
  console.log('\nAuth (one required):')
  firebaseAdminCredentialHelp().forEach((line) => console.log(`  - ${line}`))
  process.exit(0)
}

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!recipe) {
  console.error('Missing --recipe. Use --recipe app-media-flatten (or run with --help).')
  process.exit(1)
}

if (retiredRecipes.has(recipe)) {
  console.error(
    `[migrate] Recipe "${recipe}" is retired because it encodes obsolete entity authority.`
  )
  process.exit(1)
}

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: args.ecosystem || projectId,
  projectId,
})
const adminApp = initializeApp({ credential: auth.credential, projectId })
const db = databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp)

async function runAppMediaFlatten() {
  const mediaFields = [
    'thumbnail_url',
    'logo_url',
    'wordmark_light_url',
    'wordmark_dark_url',
  ]

  console.log('[migrate] app-media-flatten start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('apps').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)
    if (targetAppId) q = db.collection('apps').where(FieldPath.documentId(), '==', targetAppId)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}

      const patch = {}
      let needs = false

      const media = (data.media && typeof data.media === 'object') ? data.media : null

      const next = {
        thumbnail_url: asString(data.thumbnail_url, '') || asString(media?.thumbnail_url, ''),
        logo_url: asString(data.logo_url, '') || asString(media?.logo_url, ''),
        wordmark_light_url: asString(data.wordmark_light_url, '') || asString(media?.wordmark_light_url, ''),
        wordmark_dark_url: asString(data.wordmark_dark_url, '') || asString(media?.wordmark_dark_url, ''),
      }

      for (const field of mediaFields) {
        if (next[field] !== asString(data[field], '')) {
          patch[field] = next[field]
          needs = true
        }
      }

      if (media) {
        patch.media = FieldValue.delete()
        needs = true
      }

      if (!needs) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]

    if (targetAppId) break
  }

  console.log('[migrate] app-media-flatten done', { processed, updated, skipped, commit })
}

async function deleteCollectionTree(collectionRef) {
  let lastDoc = null

  while (true) {
    let q = collectionRef.orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      await deleteDocumentTree(docSnap.ref)
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }
}

async function deleteDocumentTree(docRef) {
  const subcollections = await docRef.listCollections()

  for (const subcollection of subcollections) {
    await deleteCollectionTree(subcollection)
  }

  await docRef.delete()
}

function toShortAddress(value) {
  if (typeof value !== 'string') return ''
  const raw = value.trim()
  if (!raw) return ''

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length <= 1) return raw

  const stripPostal = (part) =>
    part
      .replace(/^\d{4,5}-\d{2,5}\s*/g, '')
      .replace(/\b\d{3,5}\b\s*/g, '')
      .replace(/\b\d{4}\b\s*/g, '')
      .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, '')
      .replace(/\b\d{3,5}\s*[A-Za-z]{1,2}\b/g, '')
      .replace(/^[^\p{L}\p{N}]+/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

  const normalize = (part) => stripPostal(part.replace(/^\d+\s+/, '').trim())

  const selected = parts.length === 2 ? parts : parts.slice(-2)
  const cleaned = selected.map(normalize).filter(Boolean)

  if (!cleaned.length) return raw

  return cleaned
    .join(', ')
    .replace(/^[^\p{L}\p{N}]+/gu, '')
    .trim()
}

const PLACE_SHORT_NAMES = new Map([
  ['ChIJ3w_c1MA5jkcRxgKHq51MuHg', 'Migros Marktgasse'],
  ['ChIJ4WdXoJIZjkcRFH_M6dS5EPo', 'DISPO'],
  ['ChIJ5_TdZKNFj0cRunmn1AAOhAM', 'Hotel Allalin'],
  ['ChIJ84hrmh6lj0cRoczGWuTvTtE', 'Balmers Backyard'],
  ['ChIJEbkWR0ijj0cRiHfShuHPLcc', 'Bären'],
  ['ChIJGR6JR805jkcREU0bp-9yfRI', 'Dählhölzli'],
  ['ChIJHxvMffqkj0cR7zCUD5KfxXc', 'Salzano'],
  ['ChIJJRK8XSeue0gRAvddTH8ORtQ', 'Old Pint Pot'],
  ['ChIJM3aUezGjj0cRm9qzSb-cUao', 'misebox'],
  ['ChIJO1deUZqkj0cR4rc4Wz6VbOM', 'Velo Cafe'],
  ['ChIJQzGAsJCkj0cRJZIIj0XoBqA', 'Goldener Anker'],
  ['ChIJS1kBa_AGOEYRwRaP4kZIjvs', 'Boen Gård'],
  ['ChIJWS2cLEkKkEcRPkeZB6EcnLk', 'Coople'],
  ['ChIJWfJ_ovw5jkcRbC19phRjokk', "McDonald's"],
  ['ChIJXdh4fWQzGQ0Rv0Q55pCtVb4', 'Cantina da Estrela'],
  ['ChIJYfJCOagukEcRrSRZachhhlg', 'Coop Ryfflihof'],
  ['ChIJZYHwV2osOUYR6N1qUJ8m0jU', 'Hovden Lodge'],
  ['ChIJeX7lv9S_hEcRsNrcSBiCGa8', 'Rothorngipfel'],
  ['ChIJgZS5zY_8jkcRG3KbHXxkrlw', 'Hüttenzauber'],
  ['ChIJs8c-DUQ5jkcRXXVaFn1g_yw', 'Bar Roma'],
  ['ChIJswCZ5HQzGQ0REazzU1ROadQ', 'Real Palácio'],
  ['ChIJt0ko0AmgmkcRZJMyt51zAUg', 'Adia'],
  ['ChIJt1LkPOKlj0cRlu3-_x8jj90', 'Yellow Velo'],
  ['ChIJwedNwIulj0cRoVNhqVhc_mQ', 'Runft Cafe'],
  ['ChIJy9QERoAFR0YRAnMwI2eEV8Q', 'Tollboden'],
])

async function runPlacesBackfillShortName() {
  console.log('[migrate] places-backfill-short-name start', {
    projectId,
    commit,
    count: PLACE_SHORT_NAMES.size,
  })

  let processed = 0
  let updated = 0
  let skipped = 0
  let missing = 0

  let batch = db.batch()
  let batchOps = 0

  for (const [placeId, shortName] of PLACE_SHORT_NAMES.entries()) {
    processed += 1
    const ref = db.collection('places').doc(placeId)
    const snap = await ref.get()
    if (!snap.exists) {
      missing += 1
      continue
    }

    const data = snap.data() || {}
    const current = asString(data.short_name, '')
    if (current === shortName) {
      skipped += 1
      continue
    }

    updated += 1
    if (commit) {
      batch.update(ref, { short_name: shortName })
      batchOps += 1
    } else {
      console.log('[dry-run]', ref.path, { short_name: shortName })
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] places-backfill-short-name done', {
    processed,
    updated,
    skipped,
    missing,
    commit,
  })
}

async function runPlacesBackfillPlaceType() {
  console.log('[migrate] places-backfill-place-type start', {
    projectId,
    commit,
    pageSize,
    limit,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const current = asString(data.place_type, '')

      if (current === 'physical') {
        skipped += 1
        continue
      }

      updated += 1

      const patch = { place_type: 'physical' }

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] places-backfill-place-type done', { processed, updated, skipped, commit })
}

async function runJobsBackfillId() {
  console.log('[migrate] jobs-backfill-id start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('jobs').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)
    if (targetAppId) q = db.collection('jobs').where('app_id', '==', targetAppId)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const rawId = typeof data.id === 'string' ? data.id.trim() : ''
      const hasId = Boolean(rawId) && rawId.toLowerCase() !== 'undefined' && rawId.toLowerCase() !== 'null'

      if (hasId) {
        skipped += 1
        continue
      }

      updated += 1
      const patch = { id: docSnap.id }

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]

    if (targetAppId) break
  }

  console.log('[migrate] jobs-backfill-id done', { processed, updated, skipped, commit })
}

async function runPlacesBackfillShortAddress() {
  const collectionName = typeof args.collection === 'string' ? args.collection : 'places'

  console.log('[migrate] places-backfill-short-address start', {
    projectId,
    commit,
    pageSize,
    limit,
    collection: collectionName,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}

      const formatted = asString(data.formatted_address, '')
      const existing = asString(data.short_address, '')
      const next = toShortAddress(formatted) || existing

      if (!next || next === existing) {
        skipped += 1
        continue
      }

      updated += 1
      const patch = { short_address: next }

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] places-backfill-short-address done', {
    processed,
    updated,
    skipped,
    commit,
  })
}

async function runPlacesNormalizeImageShade() {
  const collectionName = typeof args.collection === 'string' ? args.collection : 'places'

  console.log('[migrate] places-normalize-image-shade start', {
    projectId,
    commit,
    pageSize,
    limit,
    collection: collectionName,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const shade = asString(data.image_shade, '')

      if (!shade || shade !== 'neutral') {
        skipped += 1
        continue
      }

      updated += 1
      const patch = { image_shade: 'none' }

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] places-normalize-image-shade done', {
    processed,
    updated,
    skipped,
    commit,
  })
}

async function runPlacesMigrateImageUrl() {
  const collectionName = typeof args.collection === 'string' ? args.collection : 'places'

  console.log('[migrate] places-migrate-image-url start', {
    projectId,
    commit,
    pageSize,
    limit,
    collection: collectionName,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}

      const patch = {}
      let needs = false

      const imageUrl = asString(data.image_url, '')
      const placeImage = asString(data.place_image, '')

      if (!imageUrl && placeImage) {
        patch.image_url = placeImage
        needs = true
      }

      if (typeof data.place_image !== 'undefined') {
        patch.place_image = FieldValue.delete()
        needs = true
      }

      if (typeof data.professionals_current !== 'undefined') {
        patch.professionals_current = FieldValue.delete()
        needs = true
      }

      if (typeof data.professionals_alumni !== 'undefined') {
        patch.professionals_alumni = FieldValue.delete()
        needs = true
      }

      if (typeof data.claimed_by !== 'string') {
        patch.claimed_by = ''
        needs = true
      }

      const shade = asString(data.image_shade, '').toLowerCase().trim()
      if (!shade || (shade !== 'light' && shade !== 'dark' && shade !== 'none')) {
        patch.image_shade = 'none'
        needs = true
      }

      if (!needs) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] places-migrate-image-url done', {
    processed,
    updated,
    skipped,
    commit,
  })
}

const INGREDIENT_UNITS = new Set([
  'g',
  'kg',
  'ml',
  'l',
  'piece',
  'pack',
  'tray',
  'case',
])


function toSafeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toNonNegativeNumber(value, fallback = 0) {
  return Math.max(0, toSafeNumber(value, fallback))
}

function toStringArray(value) {
  return Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => asString(item, '').trim())
        .filter(Boolean)
    )
  )
}

function resolveTimestamp(value) {
  if (!value) return null

  if (value instanceof Timestamp) return value

  if (typeof value?.toDate === 'function') {
    const date = value.toDate()
    if (date instanceof Date && Number.isFinite(date.getTime())) {
      return Timestamp.fromDate(date)
    }
  }

  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return Timestamp.fromDate(value)
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (Number.isFinite(parsed.getTime())) {
      return Timestamp.fromDate(parsed)
    }
    return null
  }

  if (typeof value === 'object') {
    const seconds = Number(value.seconds)
    const nanoseconds = Number(value.nanoseconds ?? 0)
    if (Number.isFinite(seconds) && Number.isFinite(nanoseconds)) {
      return new Timestamp(seconds, nanoseconds)
    }
  }

  return null
}

function timestampToMillis(value) {
  const ts = resolveTimestamp(value)
  return ts ? ts.toMillis() : null
}

function valuesEqual(a, b) {
  const aMillis = timestampToMillis(a)
  const bMillis = timestampToMillis(b)
  if (aMillis != null || bMillis != null) {
    return aMillis === bMillis
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (!valuesEqual(a[i], b[i])) return false
    }
    return true
  }

  return JSON.stringify(a) === JSON.stringify(b)
}

function resolveIngredientUnit(value) {
  const normalized = asString(value, '').trim().toLowerCase()
  return INGREDIENT_UNITS.has(normalized) ? normalized : 'piece'
}

function toSlug(value) {
  return asString(value, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveCreatorId(data) {
  const creatorId = asString(data.creator_id, '').trim()
  if (creatorId) return creatorId

  const created = data?.created
  if (created && typeof created === 'object') {
    const nestedBy = asString(created.by, '').trim()
    if (nestedBy) return nestedBy
  }

  const createdBy = data.created_by
  if (typeof createdBy === 'string') return createdBy.trim()

  if (createdBy && typeof createdBy === 'object') {
    return asString(createdBy.id, '').trim()
  }

  return ''
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function asStringArray(value) {
  return Array.isArray(value)
    ? value
        .map((entry) => asString(entry, '').trim())
        .filter(Boolean)
    : []
}

function asBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return false
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true
    if (['false', '0', 'no', 'n'].includes(normalized)) return false
  }
  return fallback
}

function pruneStoredRecord(value) {
  if (value == null) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  if (Array.isArray(value)) {
    const next = value
      .map((entry) => pruneStoredRecord(entry))
      .filter((entry) => entry !== undefined)
    return next.length ? next : undefined
  }

  if (typeof value === 'object') {
    const nextEntries = Object.entries(value).flatMap(([key, entry]) => {
      const pruned = pruneStoredRecord(entry)
      return pruned === undefined ? [] : [[key, pruned]]
    })
    return nextEntries.length ? Object.fromEntries(nextEntries) : undefined
  }

  return value
}

function normalizeStatus(value) {
  const raw = asString(value, '').trim()
  if (raw === 'draft' || raw === 'active' || raw === 'paused' || raw === 'archived') {
    return raw
  }
  return 'active'
}

function deriveCanonicalEcosystemId(data) {
  const ecosystem = asString(data.ecosystem, '').trim()
  const ecosystemId = asString(data.ecosystem_id, '').trim()

  if (ecosystem) return ecosystem
  if (ecosystemId.startsWith('fireux-')) return ecosystemId.replace(/^fireux-/, '')
  return ecosystemId
}

function deriveCanonicalProjectId(data) {
  const storedProjectId = asString(data.project_id, '').trim()
  const firebaseProjectId = asString(data.firebase_project_id, '').trim()
  const ecosystem = asString(data.ecosystem, '').trim()
  const ecosystemId = deriveCanonicalEcosystemId(data)
  const activeProjectId = asString(projectId ?? '', '').trim()

  if (
    storedProjectId &&
    storedProjectId !== ecosystem &&
    storedProjectId !== ecosystemId
  ) {
    return storedProjectId
  }
  if (firebaseProjectId) return firebaseProjectId
  if (activeProjectId) return activeProjectId
  if (storedProjectId) return storedProjectId
  if (ecosystem) return ecosystem
  if (ecosystemId) return ecosystemId
  return storedProjectId
}

function normalizeUserHandle(value) {
  let candidate = asString(value, '')
    .trim()
    .toLowerCase()

  candidate = candidate.replace(/^@+/g, '')
  candidate = candidate.replace(/\s+/g, '-')
  candidate = candidate.replace(/[^a-z0-9-]/g, '')
  candidate = candidate.replace(/-+/g, '-')
  candidate = candidate.replace(/^-+|-+$/g, '')

  return candidate.slice(0, 30)
}

function makeCanonicalUserHandle(displayName, uid, explicitHandle = '') {
  const normalizedExplicit = normalizeUserHandle(explicitHandle)
  if (normalizedExplicit) return normalizedExplicit

  const cleaned = asString(displayName, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const suffix = asString(uid, '').slice(0, 8).toLowerCase()
  const combined = `${cleaned}${suffix}`.slice(0, 30)
  return normalizeUserHandle(combined)
}

function sanitizePublicDisplayName(value) {
  const trimmed = asString(value, '').trim()
  if (!trimmed) return ''
  if (/^[^\s@]+@[^\s@]+$/.test(trimmed)) {
    return trimmed.split('@')[0]?.trim() || ''
  }
  return trimmed
}

function normalizeUserNotificationArray(value, fallbackCreatedAt) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const rec = asRecord(item)
      const created = asRecord(rec.created)

      const createdAt =
        resolveTimestamp(created.at) ??
        resolveTimestamp(rec.created_at) ??
        resolveTimestamp(rec.createdAt) ??
        fallbackCreatedAt ??
        Timestamp.now()

      const appId = asString(created.app_id, '').trim() || asString(rec.app_id, '').trim()

      let scope = asString(rec.scope, '').trim()
      if (scope !== 'app' && scope !== 'ecosystem') {
        scope = appId ? 'app' : 'ecosystem'
      }

      return {
        message: asString(rec.message, ''),
        scope,
        created: {
          at: createdAt,
          app_id: appId,
        },
        read: asBoolean(rec.read, false),
      }
    })
    .filter((item) => item.message || item.scope || item.read || item.created.app_id || item.created.at)
}

function buildCanonicalUser(docId, data) {
  const createdAt =
    resolveTimestamp(data?.created?.at) ??
    resolveTimestamp(data.created_at) ??
    resolveTimestamp(data.createdAt) ??
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    Timestamp.now()

  const updatedAt =
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    createdAt

  const createdBy = resolveCreatorId(data)
  const updatedBy = asString(data?.updated?.by, '').trim()
  const displayName =
    sanitizePublicDisplayName(data.display_name) || sanitizePublicDisplayName(data.displayName)
  const handle = makeCanonicalUserHandle(displayName, docId, asString(data.handle, '').trim())

  const created = { at: createdAt }
  const updated = { at: updatedAt }
  if (createdBy) created.by = createdBy
  if (updatedBy) updated.by = updatedBy

  return {
    display_name: displayName,
    avatar: asString(data.avatar, '').trim(),
    handle,
    email: asString(data.email, '').trim(),
    bio: asString(data.bio, ''),
    profiles: asStringArray(data.profiles),
    projects: asStringArray(data.projects),
    userOf: asStringArray(data.userOf),
    adminOf: asStringArray(data.adminOf),
    notifications: normalizeUserNotificationArray(data.notifications, createdAt),
    created,
    updated,
  }
}

function normalizeAppUserRole(value) {
  return asString(value, '').trim().toLowerCase() === 'admin' ? 'admin' : 'user'
}

function normalizeAppUserConsoleTargets(value) {
  const source = asRecord(value)
  const targets = {}

  for (const [field, ids] of Object.entries(source)) {
    if (!field.endsWith('_ids')) continue

    const nextIds = sortedUniqueStrings(ids)
    if (nextIds.length) targets[field] = nextIds
  }

  return targets
}

function buildCanonicalAppUser(docId, data, appId) {
  const createdAt =
    resolveTimestamp(data?.created?.at) ??
    resolveTimestamp(data.created_at) ??
    resolveTimestamp(data.createdAt) ??
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    Timestamp.now()

  const updatedAt =
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    createdAt

  const createdBy = resolveCreatorId(data)
  const updatedBy = asString(data?.updated?.by, '').trim()
  const created = {
    at: createdAt,
    app_id: asString(data?.created?.app_id, '').trim() || asString(appId, '').trim(),
  }
  const updated = { at: updatedAt }

  if (createdBy) created.by = createdBy
  if (updatedBy) updated.by = updatedBy

  const canonical = {
    role: normalizeAppUserRole(data.role),
    is_premium: asBoolean(data.is_premium ?? data.isPremium, false),
    console_enabled: asBoolean(data.console_enabled ?? data.consoleEnabled, false),
    notifications: normalizeUserNotificationArray(data.notifications, createdAt),
    created,
    updated,
  }
  const consoleTargets = normalizeAppUserConsoleTargets(data.console_targets)
  if (Object.keys(consoleTargets).length) {
    canonical.console_targets = consoleTargets
  }

  return canonical
}

function needsAppUserRewrite(data, canonical) {
  const canonicalKeys = Object.keys(canonical)
  const dataKeys = Object.keys(data || {})

  for (const key of canonicalKeys) {
    if (!valuesEqual(data?.[key], canonical[key])) return true
  }

  for (const key of dataKeys) {
    if (!canonicalKeys.includes(key)) return true
  }

  return false
}

function needsUserRewrite(data, canonical) {
  const canonicalKeys = Object.keys(canonical)
  const dataKeys = Object.keys(data || {})

  for (const key of canonicalKeys) {
    if (!valuesEqual(data?.[key], canonical[key])) return true
  }

  for (const key of dataKeys) {
    if (!canonicalKeys.includes(key)) return true
  }

  return false
}

function buildCanonicalApp(docId, data) {
  const media = asRecord(data.media)
  const derived = asRecord(data.derived)
  const socialLinks = asRecord(data.social_links)
  const ecosystem = asString(data.ecosystem, '')
  const projectIdValue = deriveCanonicalProjectId(data)
  const ecosystemIdValue = deriveCanonicalEcosystemId(data)

  const createdAt =
    resolveTimestamp(data?.created?.at) ??
    resolveTimestamp(data.created_at) ??
    resolveTimestamp(data.createdAt) ??
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    Timestamp.now()

  const updatedAt =
    resolveTimestamp(data?.updated?.at) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    createdAt

  const createdBy = resolveCreatorId(data)
  const updatedBy = asString(data?.updated?.by, '').trim()
  const created = { at: createdAt }
  const updated = { at: updatedAt }

  if (createdBy) created.by = createdBy
  if (updatedBy) updated.by = updatedBy

  const optionalFields =
    pruneStoredRecord({
      team: asString(data.team, ''),
      join_requests: asStringArray(data.join_requests),
      admin_ids: asStringArray(data.admin_ids),
      moderation_state: asString(data.moderation_state, ''),
      ban_reasons: asStringArray(data.ban_reasons),
      tagline: asString(data.tagline, ''),
      description: asString(data.description, ''),
      short_bio: asString(data.short_bio, ''),
      long_bio: asString(data.long_bio, ''),
      social_links: {
        website:
          asString(socialLinks.website, '') ||
          asString(data['social_links.website'], '') ||
          asString(data.source_url, ''),
        twitter: asString(socialLinks.twitter, ''),
        github: asString(socialLinks.github, ''),
        linkedin: asString(socialLinks.linkedin, ''),
        instagram: asString(socialLinks.instagram, ''),
        facebook: asString(socialLinks.facebook, ''),
        youtube: asString(socialLinks.youtube, ''),
        email: asString(socialLinks.email, ''),
      },
      media: {
        thumbnail_url: asString(media.thumbnail_url, '') || asString(data.thumbnail_url, ''),
        logo_url: asString(media.logo_url, '') || asString(data.logo_url, ''),
        wordmark_light_url:
          asString(media.wordmark_light_url, '') || asString(data.wordmark_light_url, ''),
        wordmark_dark_url:
          asString(media.wordmark_dark_url, '') || asString(data.wordmark_dark_url, ''),
        cover_url: asString(media.cover_url, '') || asString(data.cover_url, ''),
      },
    }) || {}

  return {
    project_id: projectIdValue,
    ecosystem_id: ecosystemIdValue,
    slug: asString(data.slug, ''),
    status: normalizeStatus(data.status),
    app_name: asString(data.app_name, ''),
    app_short_name: asString(data.app_short_name, ''),
    role: asString(data.role, ''),
    ecosystem,
    derived: {
      user_count:
        typeof derived.user_count === 'number' && Number.isFinite(derived.user_count)
          ? derived.user_count
          : (typeof data.user_count === 'number' && Number.isFinite(data.user_count)
              ? data.user_count
              : 0),
    },
    ...optionalFields,
    created,
    updated,
  }
}

function needsAppRewrite(data, canonical) {
  const canonicalKeys = Object.keys(canonical)
  const dataKeys = Object.keys(data || {})

  for (const key of canonicalKeys) {
    if (!valuesEqual(data?.[key], canonical[key])) return true
  }

  for (const key of dataKeys) {
    if (!canonicalKeys.includes(key)) return true
  }

  return false
}

async function runAppsCanonicalShape() {
  console.log('[migrate] apps-canonical-shape start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let processed = 0
  let updated = 0
  let skipped = 0
  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('apps').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)
    if (targetAppId) q = db.collection('apps').where(FieldPath.documentId(), '==', targetAppId)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const canonical = buildCanonicalApp(docSnap.id, data)

      if (!needsAppRewrite(data, canonical)) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.set(docSnap.ref, canonical)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, canonical)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
    if (targetAppId) break
  }

  console.log('[migrate] apps-canonical-shape done', { processed, updated, skipped, commit })
}

async function runEcosystemProjectIdFix() {
  console.log('[migrate] ecosystem-project-id-fix start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
  })

  const targetProjectId = asString(projectId, '').trim()
  if (!targetProjectId) {
    throw new Error('[migrate] ecosystem-project-id-fix requires a project id')
  }

  const now = Timestamp.now()
  const migrationBy = 'system:migration'
  const ecosystemSnap = await db.collection('ecosystems').orderBy(FieldPath.documentId()).get()
  let processed = 0
  let updated = 0

  for (const docSnap of ecosystemSnap.docs) {
    processed += 1
    const currentProjectId = asString(docSnap.data()?.project_id, '').trim()
    if (currentProjectId === targetProjectId) continue

    updated += 1

    if (commit) {
      await docSnap.ref.set(
        {
          project_id: targetProjectId,
          updated: {
            at: now,
            by: migrationBy,
          },
        },
        { merge: true }
      )
    } else {
      console.log('[dry-run]', docSnap.ref.path, {
        project_id: targetProjectId,
      })
    }
  }

  console.log('[migrate] ecosystem-project-id-fix done', {
    processed,
    updated,
    commit,
  })
}

async function runAppsDeleteRoot() {
  console.log('[migrate] apps-delete-root start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
  })

  const snap = await db.collection('apps').get()
  const liveDocIds = snap.docs.map((docSnap) => docSnap.id)
  const appIds = new Set(liveDocIds)

  const ecosystemSnap = await db.collection('ecosystems').get()
  for (const docSnap of ecosystemSnap.docs) {
    const apps = Array.isArray(docSnap.data()?.apps) ? docSnap.data().apps : []
    for (const appId of apps) {
      const normalized = asString(appId).trim()
      if (normalized) appIds.add(normalized)
    }
  }

  if (targetAppId) {
    appIds.add(targetAppId)
  }

  const subcollectionsByDoc = {}
  const orphanDocIds = []

  for (const appId of [...appIds].sort((a, b) => a.localeCompare(b))) {
    const docRef = db.collection('apps').doc(appId)
    const subcollections = await docRef.listCollections()
    subcollectionsByDoc[appId] = subcollections.map((entry) => entry.id)

    if (!liveDocIds.includes(appId) && subcollections.length) {
      orphanDocIds.push(appId)
    }
  }

  if (!commit) {
    console.log('[dry-run] apps-delete-root summary', {
      docCount: liveDocIds.length,
      docIds: liveDocIds,
      orphanDocIds,
      subcollectionsByDoc,
    })
    return
  }

  for (const appId of [...appIds].sort((a, b) => a.localeCompare(b))) {
    await deleteDocumentTree(db.collection('apps').doc(appId))
  }

  console.log('[migrate] apps-delete-root done', {
    docCount: liveDocIds.length,
    deletedDocIds: [...appIds].sort((a, b) => a.localeCompare(b)),
    orphanDocIds,
  })
}

async function runUsersDeleteRoot() {
  console.log('[migrate] users-delete-root start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
  })

  const snap = await db.collection('users').get()
  const docCount = snap.size
  const subcollectionsByDoc = {}

  for (const docSnap of snap.docs) {
    const subcollections = await docSnap.ref.listCollections()
    subcollectionsByDoc[docSnap.id] = subcollections.map((entry) => entry.id)
  }

  if (!commit) {
    console.log('[dry-run] users-delete-root summary', {
      docCount,
      docIds: snap.docs.map((doc) => doc.id),
      subcollectionsByDoc,
    })
    return
  }

  for (const docSnap of snap.docs) {
    await deleteDocumentTree(docSnap.ref)
  }

  console.log('[migrate] users-delete-root done', {
    docCount,
    deletedDocIds: snap.docs.map((doc) => doc.id),
  })
}

async function runUsersCanonicalShape() {
  console.log('[migrate] users-canonical-shape start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId || null,
  })

  if (targetAppId) {
    console.log(
      '[migrate] users-canonical-shape note: --app is ignored; this recipe rewrites all /users docs in the project.'
    )
  }

  let processed = 0
  let updated = 0
  let skipped = 0
  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('users').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const canonical = buildCanonicalUser(docSnap.id, data)

      if (!needsUserRewrite(data, canonical)) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.set(docSnap.ref, canonical)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, canonical)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] users-canonical-shape done', { processed, updated, skipped, commit })
}

async function runAppUsersCanonicalShape() {
  console.log('[migrate] app-users-canonical-shape start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    pageSize,
    limit,
    app: targetAppId || null,
  })

  let processed = 0
  let updated = 0
  let skipped = 0

  const appDocs = targetAppId
    ? [await db.collection('apps').doc(targetAppId).get()].filter((docSnap) => docSnap.exists)
    : (await db.collection('apps').orderBy(FieldPath.documentId()).get()).docs

  for (const appDoc of appDocs) {
    let lastDoc = null

    while (true) {
      if (limit && processed >= limit) break

      let q = appDoc.ref.collection('users').orderBy(FieldPath.documentId()).limit(pageSize)
      if (lastDoc) q = q.startAfter(lastDoc)

      const snap = await q.get()
      if (snap.empty) break

      let batch = db.batch()
      let batchOps = 0

      for (const docSnap of snap.docs) {
        if (limit && processed >= limit) break

        processed += 1
        const data = docSnap.data() || {}
        const canonical = buildCanonicalAppUser(docSnap.id, data, appDoc.id)

        if (!needsAppUserRewrite(data, canonical)) {
          skipped += 1
          continue
        }

        updated += 1

        if (commit) {
          batch.set(docSnap.ref, canonical)
          batchOps += 1
        } else {
          console.log('[dry-run]', docSnap.ref.path, canonical)
        }

        if (commit && batchOps >= 400) {
          await batch.commit()
          batch = db.batch()
          batchOps = 0
        }
      }

      if (commit && batchOps > 0) {
        await batch.commit()
      }

      lastDoc = snap.docs[snap.docs.length - 1]
    }

    if (limit && processed >= limit) break
  }

  console.log('[migrate] app-users-canonical-shape done', {
    processed,
    updated,
    skipped,
    commit,
  })
}

function sortedUniqueStrings(value) {
  return [...new Set(asStringArray(value))].sort((a, b) => a.localeCompare(b))
}

const APP_PROFILE_COLLECTIONS = ['agents', 'professionals', 'chefs']

function buildAppProfileOverlay(appId) {
  const now = Timestamp.now()
  return {
    created: {
      at: now,
      by: 'system:migration',
      app_id: appId,
    },
    updated: {
      at: now,
      by: 'system:migration',
    },
  }
}

async function runAppUserMirrorsRebuild() {
  console.log('[migrate] app-user-mirrors-rebuild start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    app: targetAppId || null,
  })

  const now = Timestamp.now()
  const migrationBy = 'system:migration'
  const membershipByUserId = new Map()
  const missingRootUsers = new Set()
  let touchedApps = 0
  let updatedApps = 0
  let touchedUsers = 0
  let updatedUsers = 0

  const appDocs = targetAppId
    ? [await db.collection('apps').doc(targetAppId).get()].filter((docSnap) => docSnap.exists)
    : (await db.collection('apps').orderBy(FieldPath.documentId()).get()).docs

  for (const appDoc of appDocs) {
    touchedApps += 1

    const appUsersSnap = await appDoc.ref.collection('users').get()
    const adminIds = []

    for (const userDoc of appUsersSnap.docs) {
      const canonical = buildCanonicalAppUser(userDoc.id, userDoc.data() || {}, appDoc.id)
      const uid = canonical.id || userDoc.id
      const existing =
        membershipByUserId.get(uid) || {
          userOf: new Set(),
          adminOf: new Set(),
        }

      existing.userOf.add(appDoc.id)
      if (canonical.role === 'admin') {
        existing.adminOf.add(appDoc.id)
        adminIds.push(uid)
      }

      membershipByUserId.set(uid, existing)
    }

    const nextAdminIds = sortedUniqueStrings(adminIds)
    const nextUserCount = appUsersSnap.size
    const current = appDoc.data() || {}
    const currentAdminIds = sortedUniqueStrings(current.admin_ids)
    const currentUserCount = Number(asRecord(current.derived).user_count || 0)

    if (
      !valuesEqual(currentAdminIds, nextAdminIds) ||
      !valuesEqual(currentUserCount, nextUserCount)
    ) {
      updatedApps += 1

      if (commit) {
        await appDoc.ref.update({
          admin_ids: nextAdminIds,
          'derived.user_count': nextUserCount,
          updated: {
            at: now,
            by: migrationBy,
          },
        })
      } else {
        console.log('[dry-run]', appDoc.ref.path, {
          admin_ids: nextAdminIds,
          'derived.user_count': nextUserCount,
        })
      }
    }
  }

  const rootUsersSnap = await db.collection('users').orderBy(FieldPath.documentId()).get()
  const existingRootUserIds = new Set(rootUsersSnap.docs.map((docSnap) => docSnap.id))

  for (const uid of membershipByUserId.keys()) {
    if (!existingRootUserIds.has(uid)) missingRootUsers.add(uid)
  }

  let batch = db.batch()
  let batchOps = 0

  for (const userDoc of rootUsersSnap.docs) {
    touchedUsers += 1

    const current = userDoc.data() || {}
    const currentUserOf = sortedUniqueStrings(current.userOf)
    const currentAdminOf = sortedUniqueStrings(current.adminOf)
    const membership = membershipByUserId.get(userDoc.id)

    const membershipUserOf = membership ? [...membership.userOf].sort((a, b) => a.localeCompare(b)) : []
    const membershipAdminOf = membership ? [...membership.adminOf].sort((a, b) => a.localeCompare(b)) : []

    const nextUserOf = targetAppId
      ? sortedUniqueStrings([
          ...currentUserOf.filter((entry) => entry !== targetAppId),
          ...(membershipUserOf.includes(targetAppId) ? [targetAppId] : []),
        ])
      : membershipUserOf

    const nextAdminOf = targetAppId
      ? sortedUniqueStrings([
          ...currentAdminOf.filter((entry) => entry !== targetAppId),
          ...(membershipAdminOf.includes(targetAppId) ? [targetAppId] : []),
        ])
      : membershipAdminOf

    if (valuesEqual(currentUserOf, nextUserOf) && valuesEqual(currentAdminOf, nextAdminOf)) {
      continue
    }

    updatedUsers += 1

    if (commit) {
      batch.set(
        userDoc.ref,
        {
          userOf: nextUserOf,
          adminOf: nextAdminOf,
          updated: {
            at: now,
            by: migrationBy,
          },
        },
        { merge: true }
      )
      batchOps += 1
    } else {
      console.log('[dry-run]', userDoc.ref.path, {
        userOf: nextUserOf,
        adminOf: nextAdminOf,
      })
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] app-user-mirrors-rebuild done', {
    touchedApps,
    updatedApps,
    touchedUsers,
    updatedUsers,
    missingRootUsers: [...missingRootUsers].sort((a, b) => a.localeCompare(b)),
    commit,
  })
}

async function runProfileAppOverlaysBackfill() {
  console.log('[migrate] profile-app-overlays-backfill start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    app: targetAppId || null,
  })

  let touchedApps = 0
  let touchedMemberships = 0
  let createdOverlays = 0
  let existingOverlays = 0
  let missingCoreProfiles = 0

  const appDocs = targetAppId
    ? [await db.collection('apps').doc(targetAppId).get()].filter((docSnap) => docSnap.exists)
    : (await db.collection('apps').orderBy(FieldPath.documentId()).get()).docs

  for (const appDoc of appDocs) {
    touchedApps += 1

    const appUsersSnap = await appDoc.ref.collection('users').get()
    let batch = db.batch()
    let batchOps = 0

    for (const userDoc of appUsersSnap.docs) {
      const uid = asString(userDoc.id).trim()
      if (!uid) continue

      touchedMemberships += 1

      for (const collectionName of APP_PROFILE_COLLECTIONS) {
        const coreRef = db.collection(collectionName).doc(uid)
        const coreSnap = await coreRef.get()

        if (!coreSnap.exists) {
          missingCoreProfiles += 1
          continue
        }

        const overlayRef = appDoc.ref.collection(collectionName).doc(uid)
        const overlaySnap = await overlayRef.get()

        if (overlaySnap.exists) {
          existingOverlays += 1
          continue
        }

        const payload = buildAppProfileOverlay(appDoc.id)
        createdOverlays += 1

        if (commit) {
          batch.set(overlayRef, payload)
          batchOps += 1
        } else {
          console.log('[dry-run]', overlayRef.path, payload)
        }

        if (commit && batchOps >= 400) {
          await batch.commit()
          batch = db.batch()
          batchOps = 0
        }
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }
  }

  console.log('[migrate] profile-app-overlays-backfill done', {
    touchedApps,
    touchedMemberships,
    createdOverlays,
    existingOverlays,
    missingCoreProfiles,
    commit,
  })
}

function buildCanonicalIngredient(docId, data) {
  const createdAt =
    resolveTimestamp(data.created_at) ??
    resolveTimestamp(data.createdAt) ??
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    Timestamp.now()

  const updatedAt =
    resolveTimestamp(data.updated_at) ??
    resolveTimestamp(data.updatedAt) ??
    createdAt

  const appId =
    asString(data.app_id, '').trim() ||
    asString(data.appId, '').trim() ||
    asString(targetAppId, '').trim()

  return {
    id: docId,
    name: asString(data.name, '').trim(),
    slug: toSlug(asString(data.slug, '').trim() || asString(data.name, '').trim() || docId),
    image_url: asString(data.image_url ?? data.imageUrl, '').trim(),
    app_id: appId,
    creator_id: resolveCreatorId(data),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function needsIngredientRewrite(data, canonical) {
  const canonicalKeys = Object.keys(canonical)
  const dataKeys = Object.keys(data || {})

  for (const key of canonicalKeys) {
    if (!valuesEqual(data?.[key], canonical[key])) return true
  }

  for (const key of dataKeys) {
    if (!canonicalKeys.includes(key)) return true
  }

  return false
}

async function runIngredientsCanonicalShape() {
  console.log('[migrate] ingredients-canonical-shape start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let processed = 0
  let updated = 0
  let skipped = 0
  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('ingredients').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const canonical = buildCanonicalIngredient(docSnap.id, data)

      if (!needsIngredientRewrite(data, canonical)) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.set(docSnap.ref, canonical)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, canonical)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  console.log('[migrate] ingredients-canonical-shape done', {
    processed,
    updated,
    skipped,
    commit,
  })
}

function resolveCanonicalIngredientId(docId, data) {
  const nameSlug = toSlug(data?.name)
  if (!nameSlug) return docId

  const unit = resolveIngredientUnit(data?.unit)
  const legacyUnitId = `${nameSlug}-${unit}`

  if (docId === legacyUnitId) return nameSlug
  if (/^ing_[a-z0-9_]+$/i.test(docId)) return nameSlug

  return docId
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && value.constructor === Object
}

function remapIngredientIdsDeep(value, idMap) {
  if (typeof value === 'string') {
    const mapped = idMap.get(value)
    if (!mapped || mapped === value) return { value, changed: false }
    return { value: mapped, changed: true }
  }

  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((entry) => {
      const mapped = remapIngredientIdsDeep(entry, idMap)
      if (mapped.changed) changed = true
      return mapped.value
    })
    return changed ? { value: next, changed: true } : { value, changed: false }
  }

  if (!isPlainObject(value)) return { value, changed: false }

  let changed = false
  const next = {}
  for (const [key, entry] of Object.entries(value)) {
    const mapped = remapIngredientIdsDeep(entry, idMap)
    if (mapped.changed) changed = true
    next[key] = mapped.value
  }

  return changed ? { value: next, changed: true } : { value, changed: false }
}

function isKitchenScopedPath(path) {
  const segments = String(path || '').split('/')
  return (
    segments.length >= 2 &&
    (segments[0] === 'kitchens' || segments[0] === 'test-kitchens')
  )
}

async function runIngredientsNormalizeIdShape() {
  console.log('[migrate] ingredients-normalize-id-shape start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let scanned = 0
  let skipped = 0
  let renamed = 0
  let refUpdates = 0
  let rootDeletes = 0

  const idMap = new Map()
  const sourceById = new Map()
  let lastDoc = null

  while (true) {
    if (limit && scanned >= limit) break

    let q = db.collection('ingredients').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)

    const snap = await q.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      if (limit && scanned >= limit) break
      scanned += 1

      const data = docSnap.data() || {}
      if (targetAppId) {
        const appId = asString(data.app_id, '').trim()
        if (appId && appId !== targetAppId) {
          skipped += 1
          continue
        }
      }

      sourceById.set(docSnap.id, data)
      const nextId = resolveCanonicalIngredientId(docSnap.id, data)
      if (nextId && nextId !== docSnap.id) {
        idMap.set(docSnap.id, nextId)
      } else {
        skipped += 1
      }
    }

    lastDoc = snap.docs[snap.docs.length - 1]
  }

  if (!idMap.size) {
    console.log('[migrate] ingredients-normalize-id-shape done', {
      scanned,
      renamed,
      refUpdates,
      rootDeletes,
      skipped,
      commit,
    })
    return
  }

  // 1) Create/overwrite canonical root ingredient docs first.
  for (const [fromId, toId] of idMap.entries()) {
    const source = sourceById.get(fromId) || {}
    const canonical = buildCanonicalIngredient(toId, source)

    if (commit) {
      await db.collection('ingredients').doc(toId).set(canonical)
    } else {
      console.log('[dry-run][root-set]', `ingredients/${toId}`, canonical)
    }
    renamed += 1
  }

  // 2) Move kitchen ingredient link docs to canonical ids.
  const legacyIngredientIds = new Set(idMap.keys())
  let ingredientGroupLast = null
  while (true) {
    let q = db.collectionGroup('ingredients').orderBy(FieldPath.documentId()).limit(pageSize)
    if (ingredientGroupLast) q = q.startAfter(ingredientGroupLast)

    const snap = await q.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      if (!isKitchenScopedPath(docSnap.ref.path)) continue

      const data = docSnap.data() || {}
      const fromDocId = asString(docSnap.id, '').trim()
      const fromFieldId = asString(data.ingredient_id, '').trim()
      const fromDataId = asString(data.id, '').trim()

      const legacyId =
        (legacyIngredientIds.has(fromDocId) && fromDocId) ||
        (legacyIngredientIds.has(fromFieldId) && fromFieldId) ||
        (legacyIngredientIds.has(fromDataId) && fromDataId) ||
        ''

      if (!legacyId) continue

      const toId = asString(idMap.get(legacyId), '').trim()
      if (!toId) continue

      const mapped = remapIngredientIdsDeep(data, idMap)
      const next = isPlainObject(mapped.value) ? mapped.value : { ...(data || {}) }
      next.id = toId
      next.ingredient_id = toId

      const targetRef = docSnap.ref.parent.doc(toId)

      if (commit) {
        await targetRef.set(next)
        if (targetRef.path !== docSnap.ref.path) await docSnap.ref.delete()
      } else {
        console.log('[dry-run][kitchen-ingredient-move]', docSnap.ref.path, '->', targetRef.path)
      }

      refUpdates += 1
    }

    ingredientGroupLast = snap.docs[snap.docs.length - 1]
  }

  // 3) Update all kitchen-scoped refs in dependent collections.
  const referenceCollections = [
    'dishes',
    'recipes',
    'mise',
    'menus',
    'purchases',
    'purchase-orders',
    'incoming-orders',
    'orders',
    'catalog',
  ]

  for (const group of referenceCollections) {
    let groupLast = null
    while (true) {
      let q = db.collectionGroup(group).orderBy(FieldPath.documentId()).limit(pageSize)
      if (groupLast) q = q.startAfter(groupLast)

      const snap = await q.get()
      if (snap.empty) break

      for (const docSnap of snap.docs) {
        if (!isKitchenScopedPath(docSnap.ref.path)) continue

        const data = docSnap.data() || {}
        const mapped = remapIngredientIdsDeep(data, idMap)
        if (!mapped.changed) continue

        if (commit) {
          await docSnap.ref.set(mapped.value)
        } else {
          console.log('[dry-run][ref-update]', docSnap.ref.path)
        }

        refUpdates += 1
      }

      groupLast = snap.docs[snap.docs.length - 1]
    }
  }

  // 4) Delete old root docs.
  for (const fromId of idMap.keys()) {
    const oldRef = db.collection('ingredients').doc(fromId)
    if (commit) {
      await oldRef.delete()
    } else {
      console.log('[dry-run][root-delete]', oldRef.path)
    }
    rootDeletes += 1
  }

  console.log('[migrate] ingredients-normalize-id-shape done', {
    scanned,
    renamed,
    refUpdates,
    rootDeletes,
    skipped,
    commit,
  })
}

const INGREDIENT_IMAGE_BY_ID = {
  '3COhy9KZU5yelq08HvZx':
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2F3COhy9KZU5yelq08HvZx%2Fimage_url.jpg?alt=media&token=6894fdc7-edc3-42b6-8591-c369d7674b4d',
  EZQU6kv6cnnVg20lqQpo:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FEZQU6kv6cnnVg20lqQpo%2Fimage_url.jpg?alt=media&token=390ad7f2-29fd-40f5-97e5-61381fd03efc',
  Pp2zGemsNhi6zW58fOFj:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FPp2zGemsNhi6zW58fOFj%2Fimage_url.jpg?alt=media&token=a99945fd-dddf-48b7-b984-67ac6fa34935',
  YQ9Oi5Jd9IclhElHvVYX:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FYQ9Oi5Jd9IclhElHvVYX%2Fimage_url.jpg?alt=media&token=79e32ec5-ef13-4482-92cf-eb51d27b7d77',
  YiEySWR2eEsadcoYsCLz:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FYiEySWR2eEsadcoYsCLz%2Fimage_url.jpg?alt=media&token=d477f897-539d-4c0b-8abf-a90700531c34',
  cc2xKU4FbCeZm5mv0pWW:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Fcc2xKU4FbCeZm5mv0pWW%2Fimage_url.jpg?alt=media&token=4ba9aea0-75b2-4c1a-b798-2360f64f7e16',
  ing_mea20g6t_ys9m8:
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
  oAjH2J6d7AWdGOtEcfmk:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FoAjH2J6d7AWdGOtEcfmk%2Fimage_url.jpg?alt=media&token=5fd4decd-57c7-4ce8-86ef-682f2d7b972f',
  rxRjlOJYXR9Z0q7Nq31W:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FrxRjlOJYXR9Z0q7Nq31W%2Fimage_url.jpg?alt=media&token=3ced6edd-79d7-4653-81a2-a4c07e83352a',
  tz9pN7sTBVeOIMtnHgp1:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2Ftz9pN7sTBVeOIMtnHgp1%2Fimage_url.jpg?alt=media&token=e827c480-e2c0-4a8e-92c0-0136ae5e93da',
  wZ6yS0vxqOTnkdFenM3W:
    'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/ingredients%2FwZ6yS0vxqOTnkdFenM3W%2Fimage_url.jpg?alt=media&token=49696907-ca51-42b8-8e5d-0bcdd5119794',
}

async function runIngredientsAssignImages() {
  console.log('[migrate] ingredients-assign-images start', {
    projectId,
    commit,
    app: targetAppId,
    count: Object.keys(INGREDIENT_IMAGE_BY_ID).length,
  })

  let processed = 0
  let updated = 0
  let skipped = 0
  let missing = 0

  let batch = db.batch()
  let batchOps = 0

  for (const [ingredientId, imageUrlRaw] of Object.entries(INGREDIENT_IMAGE_BY_ID)) {
    processed += 1

    const imageUrl = asString(imageUrlRaw, '').trim()
    if (!imageUrl) {
      skipped += 1
      continue
    }

    const ref = db.collection('ingredients').doc(ingredientId)
    const snap = await ref.get()
    if (!snap.exists) {
      missing += 1
      continue
    }

    const current = asString(snap.get('image_url'), '').trim()
    if (current === imageUrl) {
      skipped += 1
      continue
    }

    updated += 1
    const patch = {
      image_url: imageUrl,
      updated_at: Timestamp.now(),
    }

    if (commit) {
      batch.update(ref, patch)
      batchOps += 1
    } else {
      console.log('[dry-run]', ref.path, patch)
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] ingredients-assign-images done', {
    processed,
    updated,
    skipped,
    missing,
    commit,
  })
}

async function readPayloadInput() {
  if (payloadFile) {
    return JSON.parse(await readFile(payloadFile, 'utf8'))
  }

  if (payloadArg) {
    return JSON.parse(payloadArg)
  }

  if (!process.stdin.isTTY) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8').trim()
    if (!raw) return null
    return JSON.parse(raw)
  }

  return null
}

function parseDriftEntry(entry) {
  if (typeof entry !== 'string') return { field: '', type: '' }
  const trimmed = entry.trim()
  if (!trimmed) return { field: '', type: '' }
  const match = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    return {
      field: match[1].trim(),
      type: match[2].trim().toLowerCase(),
    }
  }
  const [name] = trimmed.split(' ')
  return { field: (name || '').trim(), type: '' }
}

function defaultForType(type) {
  switch (type) {
    case 'string':
      return ''
    case 'number':
    case 'int':
    case 'float':
      return 0
    case 'boolean':
    case 'bool':
      return false
    case 'array':
    case 'list':
      return []
    case 'object':
    case 'map':
    case 'record':
      return {}
    case 'timestamp':
    case 'date':
    case 'datetime':
      return null
    default:
      return undefined
  }
}

function getDriftDefaults(collection) {
  if (collection === 'blogs') {
    return {
      created_at: {},
      updated_at: {},
      product_id: '',
    }
  }

  if (collection === 'professionals') {
    return {
      job_title: '',
      summary: '',
      bio: '',
      image: '',
      positions: [],
    }
  }

  return {}
}

function resolveDriftTarget(payload) {
  if (!payload || typeof payload !== 'object') return null

  if (Array.isArray(payload.apps)) {
    return { collection: 'apps', items: payload.apps }
  }

  if (Array.isArray(payload.users)) {
    return { collection: 'users', items: payload.users }
  }

  if (Array.isArray(payload.blogs)) {
    return { collection: 'blogs', items: payload.blogs }
  }

  if (Array.isArray(payload.places)) {
    return { collection: 'places', items: payload.places }
  }

  if (Array.isArray(payload.jobs)) {
    return { collection: 'jobs', items: payload.jobs }
  }

  if (Array.isArray(payload.professionals)) {
    return { collection: 'professionals', items: payload.professionals }
  }

  if (Array.isArray(payload.ingredients)) {
    return { collection: 'ingredients', items: payload.ingredients }
  }

  if (typeof payload.modelPath === 'string') {
    if (payload.modelPath.includes('/fireux-core/') && payload.modelPath.includes('/app.model')) {
      return { collection: 'apps', items: payload.apps || [] }
    }
    if (payload.modelPath.includes('/fireux-core/') && payload.modelPath.includes('/user.model')) {
      return { collection: 'users', items: payload.users || [] }
    }
    if (payload.modelPath.includes('/fireux-blogs/')) {
      return { collection: 'blogs', items: payload.blogs || [] }
    }
    if (payload.modelPath.includes('/fireux-places/')) {
      return { collection: 'places', items: payload.places || [] }
    }
    if (payload.modelPath.includes('/fireux-jobs/')) {
      return { collection: 'jobs', items: payload.jobs || [] }
    }
    if (payload.modelPath.includes('/Professional/Professional.model')) {
      return { collection: 'professionals', items: payload.professionals || [] }
    }
    if (payload.modelPath.includes('/ingredient.model')) {
      return { collection: 'ingredients', items: payload.ingredients || [] }
    }
  }

  return null
}

function buildIngredientUpsertDoc(item, existing = {}) {
  const now = Timestamp.now()

  const existingName = asString(existing.name, '').trim()
  const existingImageUrl = asString(existing.image_url, '').trim()
  const existingAppId = asString(existing.app_id, '').trim()
  const existingCreatorId = asString(existing.creator_id, '').trim()

  const createdAt =
    resolveTimestamp(item?.created_at) ??
    resolveTimestamp(existing.created_at) ??
    resolveTimestamp(existing.updated_at) ??
    now

  return {
    id: asString(item?.id, '').trim(),
    name: asString(item?.name, existingName).trim(),
    image_url: asString(item?.image_url, '').trim() || existingImageUrl,
    app_id: asString(item?.app_id, '').trim() || existingAppId || asString(targetAppId, '').trim(),
    creator_id: asString(item?.creator_id, '').trim() || existingCreatorId,
    created_at: createdAt,
    updated_at: now,
  }
}

async function runIngredientsUpsertPayload() {
  const payload = await readPayloadInput()
  if (!payload) {
    console.error('Missing payload. Provide --payload, --payloadFile, or pipe JSON to stdin.')
    process.exit(1)
  }

  const target = resolveDriftTarget(payload)
  if (!target || target.collection !== 'ingredients') {
    console.error('ingredients-upsert-payload requires an ingredients payload.')
    process.exit(1)
  }

  const { items } = target
  console.log('[migrate] ingredients-upsert-payload start', {
    projectId,
    commit,
    total: Array.isArray(items) ? items.length : 0,
    app: targetAppId,
  })

  if (!Array.isArray(items) || items.length === 0) {
    console.log('[migrate] ingredients-upsert-payload done', {
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      commit,
    })
    return
  }

  let processed = 0
  let created = 0
  let updated = 0
  let skipped = 0

  for (const item of items) {
    processed += 1
    const id = asString(item?.id, '').trim()
    if (!id) {
      skipped += 1
      continue
    }

    const ref = db.collection('ingredients').doc(id)
    const snap = await ref.get()
    const existed = snap.exists
    const existing = existed ? snap.data() || {} : {}

    const next = buildIngredientUpsertDoc(item, existing)
    if (!next.name) {
      skipped += 1
      continue
    }

    if (commit) {
      await ref.set(next, { merge: true })
    } else {
      console.log('[dry-run]', ref.path, next)
    }

    if (existed) updated += 1
    else created += 1
  }

  console.log('[migrate] ingredients-upsert-payload done', {
    processed,
    created,
    updated,
    skipped,
    commit,
  })
}

async function runApplyDriftPayload() {
  const payload = await readPayloadInput()
  if (!payload) {
    console.error('Missing payload. Provide --payload, --payloadFile, or pipe JSON to stdin.')
    process.exit(1)
  }

  const target = resolveDriftTarget(payload)
  if (!target) {
    console.error('Unsupported payload. Could not resolve target collection.')
    process.exit(1)
  }

  const { collection, items } = target
  const defaults = getDriftDefaults(collection)

  console.log('[migrate] apply-drift-payload start', {
    projectId,
    commit,
    collection,
    total: Array.isArray(items) ? items.length : 0,
  })

  if (!Array.isArray(items) || items.length === 0) {
    console.log('[migrate] apply-drift-payload done', { processed: 0, updated: 0, skipped: 0, commit })
    return
  }

  let processed = 0
  let updated = 0
  let skipped = 0

  let batch = db.batch()
  let batchOps = 0

  for (const item of items) {
    processed += 1
    const id = typeof item?.id === 'string' ? item.id : ''
    if (!id) {
      skipped += 1
      continue
    }

    const drift = item?.drift || {}
    const missing = Array.isArray(drift.missing) ? drift.missing : []
    const extra = Array.isArray(drift.extra) ? drift.extra : []

    const patch = {}
    let needs = false

    for (const entry of missing) {
      const { field, type } = parseDriftEntry(entry)
      if (!field) continue
      if (Object.prototype.hasOwnProperty.call(defaults, field)) {
        patch[field] = defaults[field]
        needs = true
        continue
      }
      const fallback = defaultForType(type)
      if (fallback !== undefined) {
        patch[field] = fallback
        needs = true
      }
    }

    for (const entry of extra) {
      const { field } = parseDriftEntry(entry)
      if (!field) continue
      patch[field] = FieldValue.delete()
      needs = true
    }

    if (!needs) {
      skipped += 1
      continue
    }

    updated += 1
    const ref = db.collection(collection).doc(id)

    if (commit) {
      batch.update(ref, patch)
      batchOps += 1
    } else {
      console.log('[dry-run]', ref.path, patch)
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] apply-drift-payload done', { processed, updated, skipped, commit })
}

async function runConsoleEntityTeams() {
  console.log('[migrate] console-entity-operators start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    app: targetAppId || '(all)',
  })

  const families = ['kitchens', 'suppliers', 'portfolios', 'properties']
  const appDocs = targetAppId
    ? [await db.collection('apps').doc(targetAppId).get()].filter((docSnap) => docSnap.exists)
    : (await db.collection('apps').orderBy(FieldPath.documentId()).get()).docs

  let processedApps = 0
  let processedDocs = 0
  let processedRootProjects = 0
  let updatedDocs = 0
  let skippedDocs = 0

  let batch = db.batch()
  let batchOps = 0

  for (const appDoc of appDocs) {
    processedApps += 1

    for (const family of families) {
      const overlaysSnap = await appDoc.ref.collection(family).get()

      for (const overlayDoc of overlaysSnap.docs) {
        processedDocs += 1
        const data = overlayDoc.data() || {}
        const rootDoc = await db.collection(family).doc(overlayDoc.id).get()
        const rootData = rootDoc.exists ? rootDoc.data() || {} : {}
        const currentTeamIds = sortedUniqueStrings(data.team_ids)
        const currentOperatorIds = sortedUniqueStrings(data.operator_ids)
        const nextTeamIds = sortedUniqueStrings([
          ...asStringArray(data.team_ids),
          ...asStringArray(data.admin_ids),
          ...asStringArray(rootData.team_ids),
        ])
        const nextOperatorIds = sortedUniqueStrings([
          ...asStringArray(data.operator_ids),
          ...asStringArray(data.team_ids),
          ...asStringArray(data.admin_ids),
          ...asStringArray(rootData.operator_ids),
          ...asStringArray(rootData.team_ids),
          asString(rootData.owner_user_id, ''),
        ])
        const patch = {}
        let needs = false

        if (!valuesEqual(currentOperatorIds, nextOperatorIds)) {
          patch.operator_ids = nextOperatorIds
          needs = true
        }

        if (!Array.isArray(data.operator_ids)) {
          patch.operator_ids = nextOperatorIds
          needs = true
        }

        if (!valuesEqual(currentTeamIds, nextTeamIds)) {
          patch.team_ids = nextTeamIds
          needs = true
        }

        if (!Array.isArray(data.team_ids)) {
          patch.team_ids = nextTeamIds
          needs = true
        }

        if (Object.prototype.hasOwnProperty.call(data, 'admin_ids')) {
          patch.admin_ids = FieldValue.delete()
          needs = true
        }

        if (Object.prototype.hasOwnProperty.call(data, 'console_enabled')) {
          patch.console_enabled = FieldValue.delete()
          needs = true
        }

        if (!needs) {
          skippedDocs += 1
          continue
        }

        updatedDocs += 1

        if (commit) {
          batch.update(overlayDoc.ref, patch)
          batchOps += 1
        } else {
          console.log('[dry-run]', overlayDoc.ref.path, patch)
        }

        if (commit && batchOps >= 400) {
          await batch.commit()
          batch = db.batch()
          batchOps = 0
        }
      }
    }
  }

  const rootProjectsSnap = await db.collection('projects').get()
  for (const projectDoc of rootProjectsSnap.docs) {
    processedRootProjects += 1
    processedDocs += 1
    const data = projectDoc.data() || {}
    const currentOperatorIds = sortedUniqueStrings(data.operator_ids)
    const nextOperatorIds = sortedUniqueStrings([
      ...asStringArray(data.operator_ids),
      ...asStringArray(data.team_ids),
      asString(data.owner_user_id, ''),
    ])
    const patch = {}
    let needs = false

    if (!valuesEqual(currentOperatorIds, nextOperatorIds)) {
      patch.operator_ids = nextOperatorIds
      needs = true
    }

    if (!Array.isArray(data.operator_ids)) {
      patch.operator_ids = nextOperatorIds
      needs = true
    }

    for (const field of [
      'team_ids',
      'join_requests',
      'app_scope',
      'app_scope_state',
      'app_scope_app_id',
    ]) {
      if (!Object.prototype.hasOwnProperty.call(data, field)) continue
      patch[field] = FieldValue.delete()
      needs = true
    }

    if (!needs) {
      skippedDocs += 1
      continue
    }

    updatedDocs += 1

    if (commit) {
      batch.update(projectDoc.ref, patch)
      batchOps += 1
    } else {
      console.log('[dry-run]', projectDoc.ref.path, patch)
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] console-entity-operators done', {
    processedApps,
    processedRootProjects,
    processedDocs,
    updatedDocs,
    skippedDocs,
    commit,
  })
}

async function runConsoleTargetsRebuild() {
  console.log('[migrate] console-targets-rebuild start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    app: targetAppId || '(all)',
  })

  const familyFields = {
    kitchens: 'kitchen_ids',
    suppliers: 'supplier_ids',
    properties: 'property_ids',
    portfolios: 'portfolio_ids',
  }
  const appDocs = targetAppId
    ? [await db.collection('apps').doc(targetAppId).get()].filter((docSnap) => docSnap.exists)
    : (await db.collection('apps').orderBy(FieldPath.documentId()).get()).docs

  let processedApps = 0
  let processedTargets = 0
  let processedUsers = 0
  let updatedUsers = 0
  let skippedUsers = 0

  let batch = db.batch()
  let batchOps = 0

  for (const appDoc of appDocs) {
    processedApps += 1
    const targetsByUser = new Map()

    for (const [family, targetField] of Object.entries(familyFields)) {
      const snap = await appDoc.ref.collection(family).get()

      for (const targetDoc of snap.docs) {
        processedTargets += 1
        const data = targetDoc.data() || {}
        const operatorIds = sortedUniqueStrings([
          ...asStringArray(data.operator_ids),
          ...asStringArray(data.team_ids),
        ])

        for (const operatorId of operatorIds) {
          if (!targetsByUser.has(operatorId)) targetsByUser.set(operatorId, {})
          const targetMap = targetsByUser.get(operatorId)
          if (!targetMap[targetField]) targetMap[targetField] = new Set()
          targetMap[targetField].add(targetDoc.id)
        }
      }
    }

    for (const [operatorId, targetMap] of targetsByUser.entries()) {
      processedUsers += 1
      const appUserRef = appDoc.ref.collection('users').doc(operatorId)
      const appUserSnap = await appUserRef.get()
      const data = appUserSnap.exists ? appUserSnap.data() || {} : {}
      const currentTargets =
        data.console_targets &&
        typeof data.console_targets === 'object' &&
        !Array.isArray(data.console_targets)
          ? data.console_targets
          : {}
      const nextConsoleTargets = { ...currentTargets }
      const patch = {
        console_enabled: true,
        updated: {
          by: 'system:console-targets-rebuild',
          at: FieldValue.serverTimestamp(),
        },
      }
      let needs = !data.console_enabled

      for (const [targetField, targetIds] of Object.entries(targetMap)) {
        const nextIds = sortedUniqueStrings([...targetIds])
        const currentIds = sortedUniqueStrings(currentTargets[targetField])
        if (!valuesEqual(currentIds, nextIds)) {
          nextConsoleTargets[targetField] = nextIds
          patch.console_targets = nextConsoleTargets
          needs = true
        }
      }

      if (!appUserSnap.exists) {
        patch.role = 'user'
        patch.is_premium = false
        patch.notifications = []
        patch.created = {
          by: 'system:console-targets-rebuild',
          app_id: appDoc.id,
          at: FieldValue.serverTimestamp(),
        }
      }

      if (!needs) {
        skippedUsers += 1
        continue
      }

      updatedUsers += 1

      if (commit) {
        batch.set(appUserRef, patch, { merge: true })
        batchOps += 1
      } else {
        console.log('[dry-run]', appUserRef.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] console-targets-rebuild done', {
    processedApps,
    processedTargets,
    processedUsers,
    updatedUsers,
    skippedUsers,
    commit,
  })
}

async function runKitchenStorageNormalize() {
  if (!targetAppId) {
    console.error('kitchen-storage-normalize requires --app <appId>.')
    process.exit(1)
  }

  const operationalCollections = [
    'ingredients',
    'supplier-ingredients',
    'recipes',
    'mise',
    'orders',
    'team',
    'costs',
    'suppliers',
    'purchase-orders',
    'incoming-orders',
  ]

  console.log('[migrate] kitchen-storage-normalize start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    app: targetAppId,
  })

  const kitchensSnap = await db.collection('kitchens').orderBy(FieldPath.documentId()).get()
  let kitchensScanned = 0
  let kitchensWithOverlay = 0
  let kitchensSkippedNoOverlay = 0
  let movedCollections = 0
  let movedDocs = 0

  let batch = db.batch()
  let batchOps = 0

  for (const kitchenDoc of kitchensSnap.docs) {
    kitchensScanned += 1
    const kitchenId = kitchenDoc.id
    const targetKitchenRef = db
      .collection('apps')
      .doc(targetAppId)
      .collection('kitchens')
      .doc(kitchenId)

    const targetKitchenSnap = await targetKitchenRef.get()
    if (!targetKitchenSnap.exists) {
      kitchensSkippedNoOverlay += 1
      continue
    }

    kitchensWithOverlay += 1
    const subcollections = await kitchenDoc.ref.listCollections()

    for (const subcollection of subcollections) {
      const collectionName = subcollection.id
      if (!operationalCollections.includes(collectionName)) continue

      const sourceDocsSnap = await subcollection.get()
      if (sourceDocsSnap.empty) continue

      movedCollections += 1

      for (const sourceDoc of sourceDocsSnap.docs) {
        movedDocs += 1
        const targetDocRef = targetKitchenRef.collection(collectionName).doc(sourceDoc.id)
        const payload = sourceDoc.data() || {}

        if (commit) {
          batch.set(targetDocRef, payload)
          batch.delete(sourceDoc.ref)
          batchOps += 2
        } else {
          console.log('[dry-run][move]', {
            from: sourceDoc.ref.path,
            to: targetDocRef.path,
          })
        }

        if (commit && batchOps >= 400) {
          await batch.commit()
          batch = db.batch()
          batchOps = 0
        }
      }
    }
  }

  if (commit && batchOps > 0) {
    await batch.commit()
  }

  console.log('[migrate] kitchen-storage-normalize done', {
    kitchensScanned,
    kitchensWithOverlay,
    kitchensSkippedNoOverlay,
    movedCollections,
    movedDocs,
    commit,
  })
}

async function runAppSocialLinksNormalize() {
  console.log('[migrate] app-social-links-normalize start', {
    projectId,
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  const requiredKeys = ['website', 'twitter', 'github', 'linkedin', 'instagram']

  let processed = 0
  let updated = 0
  let skipped = 0

  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('apps').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)
    if (targetAppId) q = db.collection('apps').where(FieldPath.documentId(), '==', targetAppId)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}

      const social = (data.social_links && typeof data.social_links === 'object')
        ? data.social_links
        : {}

      const next = {}
      for (const key of requiredKeys) {
        next[key] = asString(social?.[key], '')
      }

      const needs = !requiredKeys.every(
        (key) => asString(social?.[key], '') === next[key]
      ) || Object.keys(social).some((key) => !requiredKeys.includes(key))

      if (!needs) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.update(docSnap.ref, { social_links: next })
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, { social_links: next })
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]

    if (targetAppId) break
  }

  console.log('[migrate] app-social-links-normalize done', { processed, updated, skipped, commit })
}

function buildDefaultAppDescription(docId, data, nextAppName, nextRole, nextEcosystem) {
  const name = nextAppName || asString(data.app_name, '').trim() || docId
  const role = asString(nextRole, '').trim()
  const ecosystem = asString(nextEcosystem, '').trim()

  let out = name ? `${name} is` : 'This is'
  if (role) out += ` a ${role} app`
  else out += ' an app'
  if (ecosystem) out += ` in the ${ecosystem} ecosystem`
  out += '.'
  return out
}

function buildAppContentCleanupPatch(docId, data) {
  const requiredSocialKeys = [
    'website',
    'twitter',
    'github',
    'linkedin',
    'instagram',
    'facebook',
    'youtube',
    'email',
  ]
  const social = asRecord(data.social_links)

  const appName = asString(data.app_name, '').trim()
  const appShortName = asString(data.app_short_name, '').trim() || appName

  let tagline = asString(data.tagline, '').trim()
  if (!tagline) tagline = appShortName || appName

  const role = asString(data.role, '').trim()
  const ecosystem = asString(data.ecosystem, '').trim()

  let description = asString(data.description, '').trim()
  let shortBio = asString(data.short_bio, '').trim()
  let longBio = asString(data.long_bio, '').trim()

  if (!description) {
    description =
      shortBio ||
      longBio ||
      buildDefaultAppDescription(docId, data, appName, role, ecosystem)
  }

  if (!shortBio) {
    shortBio = description || longBio || ''
  }

  if (!longBio) {
    longBio = description || shortBio || ''
  }

  const nextSocialLinks = {}
  for (const key of requiredSocialKeys) {
    nextSocialLinks[key] = asString(social?.[key], '').trim()
  }

  const derived = asRecord(data.derived)
  const userCountRaw = derived.user_count
  const userCount = Number.isFinite(Number(userCountRaw))
    ? Math.max(0, Math.trunc(Number(userCountRaw)))
    : 0

  const patch = {
    app_name: appName,
    app_short_name: appShortName,
    role,
    ecosystem,
    join_requests: toStringArray(data.join_requests),
    admin_ids: toStringArray(data.admin_ids),
    tagline,
    description,
    short_bio: shortBio,
    long_bio: longBio,
    social_links: nextSocialLinks,
    derived: {
      user_count: userCount,
    },
  }

  const keys = Object.keys(patch)
  const needs = keys.some((key) => !valuesEqual(data?.[key], patch[key]))
  return needs ? patch : null
}

async function runAppsContentCleanup() {
  console.log('[migrate] apps-content-cleanup start', {
    projectId,
    databaseId: databaseId || '(default)',
    commit,
    pageSize,
    limit,
    app: targetAppId,
  })

  let processed = 0
  let updated = 0
  let skipped = 0
  let lastDoc = null

  while (true) {
    if (limit && processed >= limit) break

    let q = db.collection('apps').orderBy(FieldPath.documentId()).limit(pageSize)
    if (lastDoc) q = q.startAfter(lastDoc)
    if (targetAppId) q = db.collection('apps').where(FieldPath.documentId(), '==', targetAppId)

    const snap = await q.get()
    if (snap.empty) break

    let batch = db.batch()
    let batchOps = 0

    for (const docSnap of snap.docs) {
      if (limit && processed >= limit) break

      processed += 1
      const data = docSnap.data() || {}
      const patch = buildAppContentCleanupPatch(docSnap.id, data)

      if (!patch) {
        skipped += 1
        continue
      }

      updated += 1

      if (commit) {
        batch.update(docSnap.ref, patch)
        batchOps += 1
      } else {
        console.log('[dry-run]', docSnap.ref.path, patch)
      }

      if (commit && batchOps >= 400) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (commit && batchOps > 0) {
      await batch.commit()
    }

    lastDoc = snap.docs[snap.docs.length - 1]
    if (targetAppId) break
  }

  console.log('[migrate] apps-content-cleanup done', { processed, updated, skipped, commit })
}

const recipes = {
  'app-media-flatten': runAppMediaFlatten,
  'app-social-links-normalize': runAppSocialLinksNormalize,
  'apps-delete-root': runAppsDeleteRoot,
  'apps-content-cleanup': runAppsContentCleanup,
  'app-users-canonical-shape': runAppUsersCanonicalShape,
  'app-user-mirrors-rebuild': runAppUserMirrorsRebuild,
  'profile-app-overlays-backfill': runProfileAppOverlaysBackfill,
  'console-entity-teams': runConsoleEntityTeams,
  'console-entity-operators': runConsoleEntityTeams,
  'console-targets-rebuild': runConsoleTargetsRebuild,
  'kitchen-storage-normalize': runKitchenStorageNormalize,
  'users-delete-root': runUsersDeleteRoot,
  'jobs-backfill-id': runJobsBackfillId,
  'places-normalize-image-shade': runPlacesNormalizeImageShade,
  'places-migrate-image-url': runPlacesMigrateImageUrl,
  'places-backfill-short-address': runPlacesBackfillShortAddress,
  'places-backfill-short-name': runPlacesBackfillShortName,
  'places-backfill-place-type': runPlacesBackfillPlaceType,
  'ingredients-canonical-shape': runIngredientsCanonicalShape,
  'ingredients-normalize-id-shape': runIngredientsNormalizeIdShape,
  'ingredients-assign-images': runIngredientsAssignImages,
  'ingredients-upsert-payload': runIngredientsUpsertPayload,
  'apply-drift-payload': runApplyDriftPayload,
}

const runner = recipes[recipe]
if (!runner) {
  console.error(`Unknown recipe: ${recipe}. Use --help to list recipes.`)
  process.exit(1)
}

await runner()
