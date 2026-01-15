#!/usr/bin/env node
/*
  Backfill Place.place_image (idempotent)

  - Reads all docs from collection: /places
  - If `place_image` is missing/empty and legacy `avatar` has a value → copies avatar → place_image
  - Also supports legacy `image_url` as a secondary fallback
  - Optionally deletes legacy fields once backfilled

  Safety:
  - Default mode is DRY RUN (no writes).
  - Use --commit to apply writes.

  Auth:
  - Uses Firebase Admin SDK with Application Default Credentials.
  - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or use gcloud ADC.

  Examples:
    node scripts/migrate-places-place-image.mjs --project your-project-id
    node scripts/migrate-places-place-image.mjs --project your-project-id --commit
    node scripts/migrate-places-place-image.mjs --project your-project-id --commit --delete-avatar
*/

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

function parseArgs(argv) {
  const args = {
    commit: false,
    deleteAvatar: false,
    deleteImageUrl: false,
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || '',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    limit: 0,
    pageSize: 300,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--commit') args.commit = true
    else if (a === '--dry-run') args.commit = false
    else if (a === '--delete-avatar') args.deleteAvatar = true
    else if (a === '--delete-image-url') args.deleteImageUrl = true
    else if (a === '--project') args.project = String(argv[++i] || '')
    else if (a === '--credentials') args.credentials = String(argv[++i] || '')
    else if (a === '--limit') args.limit = Number(argv[++i] || 0)
    else if (a === '--page-size') args.pageSize = Number(argv[++i] || 300)
    else if (a === '-h' || a === '--help') {
      console.log(
        'Usage: migrate-places-place-image [--project <id>] [--credentials <service-account.json>] [--commit] [--delete-avatar] [--delete-image-url] [--limit <n>] [--page-size <n>]'
      )
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

console.log('[migrate-place-image] start', {
  project: args.project,
  commit: args.commit,
  deleteAvatar: args.deleteAvatar,
  deleteImageUrl: args.deleteImageUrl,
  limit: args.limit || null,
  pageSize: args.pageSize,
})

let processed = 0
let updated = 0
let skipped = 0
let backfilled = 0
let deletedAvatar = 0
let deletedImageUrl = 0

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

    const existing = asString(data.place_image).trim()
    const avatar = asString(data.avatar).trim()
    const imageUrl = asString(data.image_url).trim()

    const patch = {}
    let needs = false

    // Backfill place_image from legacy fields.
    if (!existing) {
      const next = avatar || imageUrl
      if (next) {
        patch.place_image = next
        needs = true
        backfilled++
      }
    }

    if (args.deleteAvatar && 'avatar' in data) {
      patch.avatar = FieldValue.delete()
      needs = true
      deletedAvatar++
    }

    if (args.deleteImageUrl && 'image_url' in data) {
      patch.image_url = FieldValue.delete()
      needs = true
      deletedImageUrl++
    }

    processed++

    if (!needs) {
      skipped++
    } else {
      updated++
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

  console.log('[migrate-place-image] progress', {
    processed,
    updated,
    skipped,
    backfilled,
    deletedAvatar,
    deletedImageUrl,
    lastId: lastDoc?.id,
  })

  if (args.limit && processed >= args.limit) break
}

console.log('[migrate-place-image] done', {
  processed,
  updated,
  skipped,
  backfilled,
  deletedAvatar,
  deletedImageUrl,
  commit: args.commit,
})
