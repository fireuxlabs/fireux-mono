#!/usr/bin/env node
/*
  Firestore migration: normalize places.search_term

  Usage:
    node scripts/migrate-place-search-term-normalize.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null

if (help) {
  console.log('\nFirestore migration: normalize places.search_term\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-place-search-term-normalize.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]')
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

function normalizeSearchTerm(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
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

console.log('[migrate] normalize-place-search-term start', {
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

  let query = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
  if (lastDoc) query = query.startAfter(lastDoc)

  const snap = await query.get()
  if (snap.empty) break

  let batch = db.batch()
  let batchOps = 0

  for (const docSnap of snap.docs) {
    if (limit && processed >= limit) break

    processed += 1
    const data = docSnap.data() || {}

    const name = typeof data.name === 'string' ? data.name.trim() : ''
    const formatted = typeof data.formatted_address === 'string' ? data.formatted_address.trim() : ''

    const rawSearchTerm = typeof data.search_term === 'string' && data.search_term.trim().length
      ? data.search_term.trim()
      : `${name} ${formatted}`.trim()

    const normalized = normalizeSearchTerm(rawSearchTerm)

    if ((data.search_term || '') === normalized) {
      skipped += 1
      continue
    }

    updated += 1

    if (commit) {
      batch.update(docSnap.ref, { search_term: normalized })
      batchOps += 1
    } else {
      console.log('[dry-run]', docSnap.ref.path, { search_term: normalized })
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

console.log('[migrate] normalize-place-search-term done', { processed, updated, skipped, commit })
