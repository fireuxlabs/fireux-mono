#!/usr/bin/env node
/*
  Firestore migration: backfill core User shape (/users)

  - Ensures required fields exist with defaults
  - Adds timestamps and creator_id when missing

  Safety:
  - Default mode is DRY RUN (no writes).
  - Use --commit to apply writes.

  Auth:
  - Uses Firebase Admin SDK with Application Default Credentials.
  - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, or use gcloud ADC.

  Examples:
    node scripts/migrate-users-core-shape.mjs --project your-project-id
    node scripts/migrate-users-core-shape.mjs --project your-project-id --commit
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

function asString(value, fallback = '') {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

function nonEmptyText(value) {
  return asString(value, '').trim()
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null

if (help) {
  console.log(`\nFirestore migration: users core shape\n`)
  console.log('Usage:')
  console.log('  node scripts/migrate-users-core-shape.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]')
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

console.log('[migrate-users-core-shape] start', {
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
    const uid = docSnap.id

    const patch = {}
    let needs = false

    if (typeof data.id !== 'string') {
      patch.id = uid
      needs = true
    }

    const avatarMissing = !nonEmptyText(data.avatar)
    const emailMissing = !nonEmptyText(data.email)
    const bioMissing = !nonEmptyText(data.bio)

    let authUser = null
    if (avatarMissing || emailMissing || bioMissing) {
      try {
        authUser = await getAuth().getUser(uid)
      } catch {
        authUser = null
      }
    }

    if (avatarMissing) {
      const nextAvatar =
        nonEmptyText(authUser?.photoURL) ||
        '/img/core/defaults/default-thumbnail.png'
      patch.avatar = nextAvatar
      needs = true
    }

    if (emailMissing) {
      const nextEmail = nonEmptyText(authUser?.email) || `${uid}@missing.fireux`
      patch.email = nextEmail
      needs = true
    }

    if (bioMissing) {
      const fallbackBio =
        nonEmptyText(authUser?.displayName) ||
        nonEmptyText(data.display_name) ||
        nonEmptyText(data.handle) ||
        uid
      patch.bio = fallbackBio
      needs = true
    }

    if (!Array.isArray(data.profiles)) {
      patch.profiles = []
      needs = true
    }

    if (!Array.isArray(data.notifications)) {
      patch.notifications = []
      needs = true
    }

    if (!Array.isArray(data.adminOf)) {
      patch.adminOf = []
      needs = true
    }

    if (!Array.isArray(data.userOf)) {
      patch.userOf = []
      needs = true
    }

    if (typeof data.creator_id !== 'string' || !data.creator_id.trim()) {
      patch.creator_id = asString(data.creator_id, uid) || uid
      needs = true
    }

    if (!data.updated_at) {
      patch.updated_at = FieldValue.serverTimestamp()
      needs = true
    }

    if (!data.created_at) {
      patch.created_at = FieldValue.serverTimestamp()
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

console.log('[migrate-users-core-shape] done', { processed, updated, skipped, commit })
