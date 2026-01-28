#!/usr/bin/env node
/*
  Firestore migration runner (generic)

  Usage:
    node scripts/migrate.mjs --project <projectId> --recipe <name> [--commit] [--app <appId>] [--limit N] [--pageSize N]
    node scripts/migrate.mjs --project <projectId> --recipe apply-drift-payload [--commit] [--payload <json> | --payloadFile <path>]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

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
const payloadArg = typeof args.payload === 'string' ? args.payload : null
const payloadFile = typeof args.payloadFile === 'string' ? args.payloadFile : null

if (help) {
  console.log(`\nFirestore migration runner\n`)
  console.log('Usage:')
  console.log('  node scripts/migrate.mjs --project <projectId> --recipe <name> [--commit] [--app <appId>] [--limit N] [--pageSize N]')
  console.log('  node scripts/migrate.mjs --project <projectId> --recipe apply-drift-payload [--commit] [--payload <json> | --payloadFile <path>]')
  console.log('\nRecipes:')
  console.log('  - app-media-flatten')
  console.log('  - app-social-links-normalize')
  console.log('  - jobs-backfill-id')
  console.log('  - places-backfill-short-address')
  console.log('  - places-backfill-short-name')
  console.log('  - apply-drift-payload')
  console.log('\nAuth (one required):')
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)')
  console.log('  - FIREBASE_SERVICE_ACCOUNT (JSON string)')
  console.log('  - Or Google ADC (gcloud): application-default login')
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

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

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

  if (typeof payload.modelPath === 'string') {
    if (payload.modelPath.includes('/fireux-core/') && payload.modelPath.includes('/app.model')) {
      return { collection: 'apps', items: payload.apps || [] }
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
  }

  return null
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

const recipes = {
  'app-media-flatten': runAppMediaFlatten,
  'app-social-links-normalize': runAppSocialLinksNormalize,
  'jobs-backfill-id': runJobsBackfillId,
  'places-backfill-short-address': runPlacesBackfillShortAddress,
  'places-backfill-short-name': runPlacesBackfillShortName,
  'apply-drift-payload': runApplyDriftPayload,
}

const runner = recipes[recipe]
if (!runner) {
  console.error(`Unknown recipe: ${recipe}. Use --help to list recipes.`)
  process.exit(1)
}

await runner()
