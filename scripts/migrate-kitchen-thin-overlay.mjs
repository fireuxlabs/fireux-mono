#!/usr/bin/env node
/*
  Firestore migration: reconcile kitchens to thin overlay canon.

  Usage:
    node scripts/migrate-kitchen-thin-overlay.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)
const limit = args.limit ? Number(args.limit) : null

if (help) {
  console.log('\nFirestore migration: trim kitchens to thin overlay fields\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-kitchen-thin-overlay.mjs --project <projectId> [--commit] [--limit N] [--pageSize N]')
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

const fieldsToRemove = [
  'name',
  'short_name',
  'short_address',
  'formatted_address',
  'lat',
  'lng',
  'image_url',
  'place_image',
  'image_shade',
  'website',
  'search_term',
  'search_term_normalized',
  'source',
  'claimed_by',
  'creator_id',
]

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

console.log('[migrate] kitchen-thin-overlay start', {
  projectId,
  commit,
  pageSize,
  limit,
})

let processed = 0
let updated = 0
let skipped = 0
let violations = 0
const missingPlaceKitchenIds = []

let lastDoc = null

while (true) {
  if (limit && processed >= limit) break

  let query = db.collection('kitchens').orderBy(FieldPath.documentId()).limit(pageSize)
  if (lastDoc) query = query.startAfter(lastDoc)

  const snap = await query.get()
  if (snap.empty) break

  let batch = db.batch()
  let batchOps = 0

  for (const docSnap of snap.docs) {
    if (limit && processed >= limit) break

    processed += 1
    const data = docSnap.data() || {}
    const kitchenId = String(docSnap.id || '').trim()
    const isTestKitchen = Boolean(data.is_test_kitchen)

    if (!isTestKitchen) {
      const placeSnap = await db.collection('places').doc(kitchenId).get()
      if (!placeSnap.exists) {
        violations += 1
        missingPlaceKitchenIds.push(kitchenId)
        console.error('[migrate] kitchen-thin-overlay missing_place_for_live_kitchen', {
          kitchenId,
        })
        skipped += 1
        continue
      }
    }

    const patch = {}
    let needs = false

    if (typeof data.is_test_kitchen !== 'boolean') {
      patch.is_test_kitchen = false
      needs = true
    }

    if (String(data.id || '').trim() !== kitchenId) {
      patch.id = kitchenId
      needs = true
    }

    for (const field of fieldsToRemove) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        patch[field] = FieldValue.delete()
        needs = true
      }
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

  console.log('[migrate] kitchen-thin-overlay progress', {
    processed,
    updated,
    skipped,
    violations,
    lastId: lastDoc?.id,
  })
}

console.log('[migrate] kitchen-thin-overlay done', {
  processed,
  updated,
  skipped,
  violations,
  commit,
})

if (violations > 0) {
  console.error('[migrate] kitchen-thin-overlay invariant_violations', {
    missingPlaceKitchenIds,
  })
  process.exit(2)
}
