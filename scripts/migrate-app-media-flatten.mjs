#!/usr/bin/env node
/*
  Firestore migration: flatten App media fields

  - Reads all docs from collection: /apps
  - Moves nested media.* fields into flat top-level fields
  - Removes media object to eliminate drift

  Safety:
  - Default mode is DRY RUN (no writes).
  - Use --commit to apply writes.

  Auth:
  - Uses Firebase Admin SDK with Application Default Credentials.
  - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or use gcloud ADC.

  Examples:
    node scripts/migrate-app-media-flatten.mjs --project your-project-id
    node scripts/migrate-app-media-flatten.mjs --project your-project-id --commit
    node scripts/migrate-app-media-flatten.mjs --project your-project-id --app misebox-app --commit
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

if (help) {
  console.log(`\nFirestore migration: apps media flatten (media.* -> flat fields)\n`)
  console.log('Usage:')
  console.log('  node scripts/migrate-app-media-flatten.mjs --project <projectId> [--commit] [--app <appId>] [--limit N] [--pageSize N]')
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

const mediaFields = [
  'thumbnail_url',
  'logo_url',
  'wordmark_light_url',
  'wordmark_dark_url',
]

console.log('[migrate-app-media-flatten] start', {
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

console.log('[migrate-app-media-flatten] done', { processed, updated, skipped, commit })
