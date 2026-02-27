#!/usr/bin/env node
/*
  Firestore migration: backfill handles index from /users.

  - Reads /users/{uid}
  - For each valid handle, ensures /handles/{handle} -> { uid }
  - Does NOT overwrite collisions (logs and skips)

  Safety:
  - Default mode is DRY RUN.
  - Use --commit to apply writes.

  Usage:
    node scripts/backfill-user-handles-index.mjs --project <projectId>
    node scripts/backfill-user-handles-index.mjs --project <projectId> --commit
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const RESERVED_HANDLES = new Set([
  'admin',
  'api',
  'apps',
  'auth',
  'blog',
  'console',
  'dev',
  'jobs',
  'kitchens',
  'modules',
  'orders',
  'products',
  'settings',
  'solutions',
  'u',
  'users',
])

const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30
const HANDLE_PATTERN = /^[a-z0-9-]+$/

const normalizeHandle = (raw) => {
  let candidate = String(raw || '')
    .trim()
    .toLowerCase()
  candidate = candidate.replace(/^@+/g, '')
  candidate = candidate.replace(/\s+/g, '-')
  candidate = candidate.replace(/[^a-z0-9-]/g, '')
  candidate = candidate.replace(/-+/g, '-')
  candidate = candidate.replace(/^-+|-+$/g, '')
  return candidate.slice(0, MAX_HANDLE_LENGTH)
}

const isValidHandle = (value) => {
  if (!value) return false
  if (value.length < MIN_HANDLE_LENGTH) return false
  if (value.length > MAX_HANDLE_LENGTH) return false
  if (!HANDLE_PATTERN.test(value)) return false
  if (RESERVED_HANDLES.has(value)) return false
  return true
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null

if (help) {
  console.log('\nFirestore migration: backfill handles index from users\n')
  console.log('Usage:')
  console.log('  node scripts/backfill-user-handles-index.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]')
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

console.log('[backfill-user-handles-index] start', {
  projectId,
  commit,
  pageSize,
  limit,
})

let processed = 0
let missingHandle = 0
let invalidHandle = 0
let created = 0
let collisions = 0
let alreadyLinked = 0
let normalizedMismatches = 0
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

    const uid = docSnap.id
    const data = docSnap.data() || {}
    const rawHandle = String(data.handle || '').trim()
    const handle = normalizeHandle(rawHandle)

    if (!rawHandle) {
      missingHandle += 1
      continue
    }

    if (!isValidHandle(handle)) {
      invalidHandle += 1
      console.log('[skip-invalid]', { uid, rawHandle, normalized: handle })
      continue
    }

    if (rawHandle !== handle) normalizedMismatches += 1

    const handleRef = db.collection('handles').doc(handle)
    const handleSnap = await handleRef.get()

    if (!handleSnap.exists) {
      created += 1
      const patch = {
        uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      }

      if (commit) {
        batch.set(handleRef, patch)
        batchOps += 1
      } else {
        console.log('[dry-run:create]', handleRef.path, patch)
      }
    } else {
      const existingUid = String(handleSnap.data()?.uid || '').trim()
      if (existingUid === uid) {
        alreadyLinked += 1
      } else {
        collisions += 1
        console.log('[collision]', {
          handle,
          expectedUid: uid,
          existingUid,
          handlePath: handleRef.path,
        })
      }
    }

    if (commit && batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (commit && batchOps > 0) await batch.commit()
  lastDoc = snap.docs[snap.docs.length - 1]
}

console.log('[backfill-user-handles-index] done', {
  processed,
  missingHandle,
  invalidHandle,
  created,
  alreadyLinked,
  collisions,
  normalizedMismatches,
  commit,
})

