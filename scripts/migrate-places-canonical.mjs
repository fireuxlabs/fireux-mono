#!/usr/bin/env node
/*
  Canonical Place migration (idempotent)

  - Reads all docs from collection: /places
  - Writes back to the SAME document id
  - Ensures canonical fields exist (defaults: '' or 0)
  - Migrates legacy: source 'firestore' -> 'firebase' (and never emits 'firestore')
  - Deletes legacy fields if present:
      - place_id
      - professionals_current
      - professionals_alumni

  Safety:
  - Default mode is DRY RUN (no writes).
  - Use --commit to apply writes.

  Auth:
  - Uses Firebase Admin SDK with Application Default Credentials.
  - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or use gcloud ADC.

  Examples:
    node scripts/migrate-places-canonical.mjs --project your-project-id
    node scripts/migrate-places-canonical.mjs --project your-project-id --commit
    node scripts/migrate-places-canonical.mjs --project your-project-id --commit --limit 500
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

function parseArgs(argv) {
  const args = {
    commit: false,
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || '',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    limit: 0,
    pageSize: 300,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--commit') args.commit = true
    else if (a === '--dry-run') args.commit = false
    else if (a === '--project') args.project = String(argv[++i] || '')
    else if (a === '--credentials') args.credentials = String(argv[++i] || '')
    else if (a === '--limit') args.limit = Number(argv[++i] || 0)
    else if (a === '--page-size') args.pageSize = Number(argv[++i] || 300)
    else if (a === '-h' || a === '--help') {
      console.log('Usage: migrate-places-canonical [--project <id>] [--credentials <service-account.json>] [--commit] [--limit <n>] [--page-size <n>]')
      process.exit(0)
    }
  }

  if (!Number.isFinite(args.pageSize) || args.pageSize <= 0) args.pageSize = 300
  if (!Number.isFinite(args.limit) || args.limit < 0) args.limit = 0

  return args
}

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeSearchTerm(name, formattedAddress) {
  return `${asString(name)} ${asString(formattedAddress)}`.toLowerCase().trim()
}

const args = parseArgs(process.argv)

if (!args.project) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (args.credentials && args.credentials.trim()) {
    const path = args.credentials.trim()
    const raw = await readFile(path, 'utf8')
    const json = JSON.parse(raw)
    return cert(json)
  }
  return applicationDefault()
}

initializeApp({ credential: await resolveCredential(), projectId: args.project })

const db = getFirestore()

const collectionName = 'places'

console.log('[migrate-places] start', {
  project: args.project,
  commit: args.commit,
  limit: args.limit || null,
  pageSize: args.pageSize,
})

let processed = 0
let updated = 0
let skipped = 0
let missingPlaceImagesFixed = 0

let lastDoc = null

while (true) {
  let q = db
    .collection(collectionName)
    .orderBy(FieldPath.documentId())
    .limit(args.pageSize)

  if (lastDoc) q = q.startAfter(lastDoc)

  const snap = await q.get()
  if (snap.empty) break

  const batch = db.batch()
  let batchOps = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data() || {}

    const docId = docSnap.id
    const legacyPlaceId = asString(data.place_id || '')
    const id = docId || asString(data.id || legacyPlaceId || docId)

    // Canon: stored docs are always firebase.
    const sourceRaw = asString(data.source || '')

    const name = asString(data.name)
    const formatted_address = asString(data.formatted_address)
    const placeImageNullish = data.place_image == null
    const place_image = asString(data.place_image || data.avatar || data.image_url)
    const lat = asNumber(data.lat)
    const lng = asNumber(data.lng)

    const search_term = asString(data.search_term) || normalizeSearchTerm(name, formatted_address)

    const creator_id = asString(data.creator_id)

    const patch = {
      id,
      source: 'firebase',
      name,
      formatted_address,

      place_image,
      lat,
      lng,
      search_term,
      creator_id,

      // Legacy deletions
      place_id: FieldValue.delete(),
      professionals_current: FieldValue.delete(),
      professionals_alumni: FieldValue.delete(),
    }

    // Only add timestamps if missing.
    if (!data.created_at) patch.created_at = FieldValue.serverTimestamp()
    if (!data.updated_at) patch.updated_at = FieldValue.serverTimestamp()

    // Determine whether anything actually needs changing.
    const needs =
      asString(data.id || '') !== id ||
      asString(data.source || '') !== 'firebase' ||
      'place_id' in data ||
      'professionals_current' in data ||
      'professionals_alumni' in data ||
      placeImageNullish ||
      !('place_image' in data) ||
      !('search_term' in data) ||
      !('creator_id' in data) ||
      !data.created_at ||
      !data.updated_at

    processed++

    if (!needs) {
      skipped++
    } else {
      updated++
      if (placeImageNullish) missingPlaceImagesFixed++
      if (args.commit) {
        batch.set(docSnap.ref, patch, { merge: true })
        batchOps++
      }
    }

    if (args.limit && processed >= args.limit) break
  }

  lastDoc = snap.docs[snap.docs.length - 1]

  if (args.commit && batchOps) {
    await batch.commit()
  }

  console.log('[migrate-places] progress', {
    processed,
    updated,
    skipped,
    missingPlaceImagesFixed,
    lastId: lastDoc?.id,
  })

  if (args.limit && processed >= args.limit) break
}

console.log('[migrate-places] done', {
  processed,
  updated,
  skipped,
  missingPlaceImagesFixed,
  commit: args.commit,
})
