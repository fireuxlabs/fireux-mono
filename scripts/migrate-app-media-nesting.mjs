#!/usr/bin/env node
/*
  Firestore migration: backfill App.media + required fields

  - Reads all docs from collection: /apps
  - Moves legacy flat media fields into `media.*`
  - Removes legacy flat fields to eliminate drift
  - Backfills missing required fields with safe defaults

  Safety:
  - Default mode is DRY RUN (no writes).
  - Use --commit to apply writes.

  Auth:
  - Uses Firebase Admin SDK with Application Default Credentials.
  - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or use gcloud ADC.

  Examples:
    node scripts/migrate-app-media-nesting.mjs --project your-project-id
    node scripts/migrate-app-media-nesting.mjs --project your-project-id --commit
    node scripts/migrate-app-media-nesting.mjs --project your-project-id --app misebox-app --commit
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

function nonEmptyText(value) {
  const text = asString(value, '').trim()
  return text
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function asNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null
const targetAppId = typeof args.app === 'string' ? args.app : null

if (help) {
  console.log(`\nFirestore migration: apps media nesting + backfill required fields\n`)
  console.log('Usage:')
  console.log('  node scripts/migrate-app-media-nesting.mjs --project <projectId> [--commit] [--app <appId>] [--limit N] [--pageSize N]')
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

const legacyMediaFields = [
  'thumbnail_url',
  'logo_url',
  'wordmark_light_url',
  'wordmark_dark_url',
]

const requiredStringFields = [
  'app_short_name',
  'tagline',
  'short_bio',
  'long_bio',
]

console.log('[migrate-app-media-nesting] start', {
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

    const media = (data.media && typeof data.media === 'object') ? data.media : {}

    const legacy = {
      thumbnail_url: asString(data.thumbnail_url, ''),
      logo_url: asString(data.logo_url, ''),
      wordmark_light_url: asString(data.wordmark_light_url, ''),
      wordmark_dark_url: asString(data.wordmark_dark_url, ''),
    }

    const mediaNext = {
      thumbnail_url: asString(media.thumbnail_url, '') || legacy.thumbnail_url,
      logo_url: asString(media.logo_url, '') || legacy.logo_url,
      wordmark_light_url: asString(media.wordmark_light_url, '') || legacy.wordmark_light_url,
      wordmark_dark_url: asString(media.wordmark_dark_url, '') || legacy.wordmark_dark_url,
    }

    for (const key of Object.keys(mediaNext)) {
      if (mediaNext[key] !== asString(media[key], '')) {
        patch[`media.${key}`] = mediaNext[key]
        needs = true
      }
    }

    for (const field of legacyMediaFields) {
      if (field in data) {
        patch[field] = FieldValue.delete()
        needs = true
      }
    }

    const textFallbacks = {
      app_short_name: nonEmptyText(data.app_short_name) || nonEmptyText(data.app_name) || nonEmptyText(data.id),
      tagline: nonEmptyText(data.tagline) || nonEmptyText(data.app_name) || nonEmptyText(data.id),
      short_bio: nonEmptyText(data.short_bio) || nonEmptyText(data.description) || nonEmptyText(data.app_name),
      long_bio:
        nonEmptyText(data.long_bio) ||
        nonEmptyText(data.description) ||
        nonEmptyText(data.short_bio) ||
        nonEmptyText(data.app_name),
    }

    for (const field of requiredStringFields) {
      const current = nonEmptyText(data[field])
      const next = textFallbacks[field] || ''
      if (!current && next) {
        patch[field] = next
        needs = true
      }
    }

    if (!Array.isArray(data.join_requests)) {
      patch.join_requests = []
      needs = true
    }

    if (typeof data.user_count !== 'number') {
      patch.user_count = 0
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

console.log('[migrate-app-media-nesting] done', { processed, updated, skipped, commit })
