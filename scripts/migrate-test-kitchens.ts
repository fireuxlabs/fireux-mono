#!/usr/bin/env node
/*
  LEGACY: Migrate kitchen docs into the obsolete test-kitchens collection.

  Current Misebox test canon is:
    misebox-simulation/kitchens/{uid}

  Prefer:
    node scripts/sync-misebox-test-kitchen.mjs --kitchen <uid> --commit

  Usage:
    pnpm -s tsx scripts/migrate-test-kitchens.ts --project <projectId> --allow-legacy-test-kitchens [--commit] [--delete-source] [--force] [--ids <csv>]

  Notes:
    - By default runs in dry-run mode and uses the hardcoded ID list below.
    - Use --ids to override the list (comma-separated).
    - Use --delete-source to remove the original kitchens docs after copy.

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const DEFAULT_IDS = [
  'ChIJGR6JR805jkcREU0bp-9yfRI',
  'ChIJJRK8XSeue0gRAvddTH8ORtQ',
  'ChIJM3aUezGjj0cRm9qzSb-cUao',
  'ChIJWS2cLEkKkEcRPkeZB6EcnLk',
  'ChIJbb-8EJqkj0cRaTZzUz6bnsY',
  'ChIJcUsl4xejj0cRbug8Ds7VHNc',
  'ChIJeX7lv9S_hEcRsNrcSBiCGa8',
  'ChIJmXacLZqkj0cRw7jhIozyjkE',
  'jMK33p5XlhYS8rBCEf8qUiogfMg2',
]

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
const commit = Boolean(args.commit)
const force = Boolean(args.force)
const deleteSource = Boolean(args['delete-source'] || args.deleteSource)
const allowLegacyTestKitchens = Boolean(args['allow-legacy-test-kitchens'])
const idsArg = typeof args.ids === 'string' ? args.ids : ''
const ids = idsArg
  ? idsArg.split(',').map((id) => id.trim()).filter(Boolean)
  : DEFAULT_IDS

if (!allowLegacyTestKitchens) {
  console.error(
    'Refusing to write obsolete test-kitchens root. ' +
      'Current canon is misebox-simulation/kitchens/{uid}. ' +
      'Use scripts/sync-misebox-test-kitchen.mjs, or pass --allow-legacy-test-kitchens intentionally.'
  )
  process.exit(1)
}

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!ids.length) {
  console.error('No kitchen IDs provided.')
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
let copied = 0
let skippedExisting = 0
let missing = 0
let deleted = 0

let batch = db.batch()
let ops = 0

for (const id of ids) {
  processed += 1
  const kitchenRef = db.collection('kitchens').doc(id)
  const testKitchenRef = db.collection('test-kitchens').doc(id)

  const kitchenSnap = await kitchenRef.get()
  if (!kitchenSnap.exists) {
    console.log('[missing]', id)
    missing += 1
    continue
  }

  if (!force) {
    const existing = await testKitchenRef.get()
    if (existing.exists) {
      console.log('[skip existing]', id)
      skippedExisting += 1
      continue
    }
  }

  const data = kitchenSnap.data() ?? {}
  const payload = {
    ...data,
    id: typeof data.id === 'string' && data.id.trim().length > 0 ? data.id : id,
  }

  if (!commit) {
    console.log('[dry-run]', id, deleteSource ? 'copy+delete' : 'copy')
    copied += 1
    continue
  }

  batch.set(testKitchenRef, payload, { merge: true })
  ops += 1
  copied += 1

  if (deleteSource) {
    batch.delete(kitchenRef)
    ops += 1
    deleted += 1
  }

  if (ops >= 400) {
    await batch.commit()
    batch = db.batch()
    ops = 0
  }
}

if (ops > 0) {
  await batch.commit()
}

console.log('\nSummary')
console.log('  processed:', processed)
console.log('  copied:', copied)
console.log('  skippedExisting:', skippedExisting)
console.log('  missing:', missing)
console.log('  deleted:', deleted)
console.log('  commit:', commit)
console.log('  deleteSource:', deleteSource)
