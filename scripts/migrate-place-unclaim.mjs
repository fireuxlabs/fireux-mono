#!/usr/bin/env node
/*
  Firestore migration: clear claimed_by for a place document.

  Defaults are preconfigured for Dählhölzli in Misebox.

  Usage:
    node scripts/migrate-place-unclaim.mjs --project <projectId> [--commit]
    node scripts/migrate-place-unclaim.mjs --project <projectId> --place <placeId> [--expected-claimed-by <uid>] [--commit]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PLACE_ID = 'ChIJGR6JR805jkcREU0bp-9yfRI'
const DEFAULT_EXPECTED_CLAIMED_BY = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)

const placeId = String(args.place || DEFAULT_PLACE_ID).trim()
const expectedClaimedBy = String(
  args['expected-claimed-by'] || DEFAULT_EXPECTED_CLAIMED_BY
).trim()

if (help) {
  console.log('\nFirestore migration: clear place claimed_by\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-place-unclaim.mjs --project <projectId> [--commit]')
  console.log('  node scripts/migrate-place-unclaim.mjs --project <projectId> --place <placeId> [--expected-claimed-by <uid>] [--commit]')
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

if (!placeId) {
  console.error('Missing --place (or default place id).')
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

console.log('[migrate] place-unclaim start', {
  projectId,
  commit,
  placeId,
  expectedClaimedBy,
})

const placeRef = db.collection('places').doc(placeId)
const placeSnap = await placeRef.get()

if (!placeSnap.exists) {
  console.error('[migrate] place-unclaim missing_place', { placePath: placeRef.path })
  process.exit(2)
}

const placeData = placeSnap.data() || {}
const currentClaimedBy = String(placeData.claimed_by || '').trim()

console.log('[migrate] place-unclaim state', {
  placePath: placeRef.path,
  beforeClaimedBy: currentClaimedBy,
})

if (expectedClaimedBy && currentClaimedBy && currentClaimedBy !== expectedClaimedBy) {
  console.error('[migrate] place-unclaim unexpected_claim_owner', {
    expectedClaimedBy,
    currentClaimedBy,
  })
  process.exit(3)
}

if (!currentClaimedBy) {
  console.log('[migrate] place-unclaim no_change')
  process.exit(0)
}

if (!commit) {
  console.log('[dry-run]', placeRef.path, { claimed_by: '' })
  console.log('[migrate] place-unclaim done', { commit, updated: 0 })
  process.exit(0)
}

await placeRef.update({ claimed_by: '' })

console.log('[migrate] place-unclaim done', {
  commit,
  updated: 1,
  afterClaimedBy: '',
})