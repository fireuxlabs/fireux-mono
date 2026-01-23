#!/usr/bin/env node
/*
  Backfill creator_id for all Places.

  Usage:
    pnpm -s tsx scripts/migrate-place-creator-id.ts --project <projectId> --creator <uid> --commit [--pageSize 250]

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) continue
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        out[key] = true
      } else {
        out[key] = next
        i += 1
      }
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const projectId =
  (typeof args.project === 'string' && args.project) ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  ''
const creatorId =
  (typeof args.creator === 'string' && args.creator) ||
  process.env.FIREUX_CREATOR_ID ||
  ''
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!creatorId) {
  console.error('Missing --creator (or FIREUX_CREATOR_ID).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }
  return applicationDefault()
}

if (!getApps().length) {
  initializeApp({
    credential: await resolveCredential(),
    projectId,
  })
}

const db = getFirestore()

let processed = 0
let updated = 0
let skipped = 0
let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null

while (true) {
  let q = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
  if (lastDoc) q = q.startAfter(lastDoc)

  const snap = await q.get()
  if (snap.empty) break

  let batch = db.batch()
  let ops = 0

  for (const docSnap of snap.docs) {
    processed += 1
    lastDoc = docSnap
    const data = docSnap.data() || {}
    const existing = typeof data.creator_id === 'string' ? data.creator_id.trim() : ''

    if (existing) {
      skipped += 1
      continue
    }

    if (!commit) {
      console.log('[dry-run]', docSnap.id, 'set creator_id')
      skipped += 1
      continue
    }

    batch.update(docSnap.ref, {
      creator_id: creatorId,
      updated_at: FieldValue.serverTimestamp(),
    })
    ops += 1

    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
    updated += 1
  }

  if (ops > 0) {
    await batch.commit()
  }
}

console.log('\nSummary')
console.log('  processed:', processed)
console.log('  updated:', updated)
console.log('  skipped:', skipped)
