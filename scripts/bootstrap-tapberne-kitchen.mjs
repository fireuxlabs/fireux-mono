#!/usr/bin/env node
/*
  Bootstrap: Create La Tap Berne kitchen and place documents.
  
  Writes:
    - places/{kitchenId}
    - kitchens/{kitchenId}
  
  Usage:
    node scripts/bootstrap-tapberne-kitchen.mjs --project <projectId> [--commit]
  
  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0' // La Tap Berne

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const kitchenId = String(args.kitchen || DEFAULT_KITCHEN_ID).trim()

if (help) {
  console.log('\nBootstrap: Create La Tap Berne kitchen and place documents\n')
  console.log('Usage:')
  console.log('  node scripts/bootstrap-tapberne-kitchen.mjs --project <projectId>')
  console.log('  node scripts/bootstrap-tapberne-kitchen.mjs --project <projectId> --commit')
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

if (!kitchenId) {
  console.error('Missing --kitchen (or default kitchen id).')
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

const now = Timestamp.now()

const placeDoc = {
  id: kitchenId,
  name: 'La Tap Berne',
  short_name: 'La Tap Berne',
  short_address: 'Berne, Switzerland',
  formatted_address: 'Interlaken, Switzerland',
  lat: 46.6863,
  lng: 7.6612,
  types: ['restaurant'],
  image_url: '',
  image_shade: 'light',
  created: {
    at: now,
    by: 'bootstrap',
    app_id: 'misebox-app',
  },
  updated: {
    at: now,
    by: 'bootstrap',
  },
}

const kitchenDoc = {
  id: kitchenId,
  is_test_kitchen: false,
  place_id: kitchenId,
  created: {
    at: now,
    by: 'bootstrap',
    app_id: 'misebox-app',
  },
  updated: {
    at: now,
    by: 'bootstrap',
  },
}

console.log('[bootstrap] tapberne-kitchen start', {
  projectId,
  kitchenId,
  commit,
})

console.log('[bootstrap] Preview:')
console.log('  places/' + kitchenId, placeDoc)
console.log('  kitchens/' + kitchenId, kitchenDoc)

if (!commit) {
  console.log('\n[bootstrap] Dry-run. Add --commit to write to Firestore.')
  process.exit(0)
}

try {
  await db.collection('places').doc(kitchenId).set(placeDoc)
  console.log('[bootstrap] Created places/' + kitchenId)

  await db.collection('kitchens').doc(kitchenId).set(kitchenDoc)
  console.log('[bootstrap] Created kitchens/' + kitchenId)

  console.log('[bootstrap] Success!')
  console.log('\nNext steps:')
  console.log('  1. Run menu migration:')
  console.log(`     node scripts/migrate-tapberne-menus.mjs --project ${projectId} --commit`)
  console.log('  2. Run channel menu migration:')
  console.log(`     node scripts/migrate-tapberne-channel-menus.mjs --project ${projectId} --commit`)
  console.log('  3. Run menu items to dishes migration:')
  console.log(`     node scripts/migrate-tapberne-menu-items-to-dishes.mjs --project ${projectId} --commit`)
  process.exit(0)
} catch (err) {
  console.error('[bootstrap] Error:', err?.message || err)
  process.exit(1)
}
