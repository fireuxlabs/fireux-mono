#!/usr/bin/env node
/*
  Firestore migration: backfill kitchens/*/dishes/* short_name.

  Reads:
    kitchens/{kitchenId}/dishes/*

  Writes (commit mode only):
    kitchens/{kitchenId}/dishes/{dishId}.short_name

  Usage:
    node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId>
    node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId> --commit
    node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId> --kitchen <kitchenId> --commit

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const kitchenIdFilter = String(args.kitchen || '').trim()

if (help) {
  console.log('\nFirestore migration: backfill dish short_name\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId>')
  console.log('  node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId> --commit')
  console.log('  node scripts/migrate-kitchen-dish-short-names.mjs --project <projectId> --kitchen <kitchenId> --commit')
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

const toShortName = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.length <= 24) return raw

  const compact = raw
    .replace(/\s*·\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (compact.length <= 24) return compact
  return `${compact.slice(0, 21).trim()}...`
}

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

console.log('[migrate] kitchen-dish-short-names start', {
  projectId,
  kitchenId: kitchenIdFilter || '(all)',
  commit,
})

const kitchenRefs = kitchenIdFilter
  ? [db.collection('kitchens').doc(kitchenIdFilter)]
  : (await db.collection('kitchens').select().get()).docs.map((docSnap) => docSnap.ref)

let kitchensScanned = 0
let dishesScanned = 0
let plannedUpdates = 0

for (const kitchenRef of kitchenRefs) {
  kitchensScanned += 1
  const dishesSnap = await kitchenRef.collection('dishes').get()

  for (const dishSnap of dishesSnap.docs) {
    dishesScanned += 1
    const data = dishSnap.data() || {}

    const currentShortName = String(data.short_name || '').trim()
    if (currentShortName) continue

    const sourceName = String(data.name || '').trim()
    const nextShortName = toShortName(sourceName)
    if (!nextShortName) continue

    plannedUpdates += 1

    if (!commit) {
      console.log('[dry-run-update-dish-short-name]', dishSnap.ref.path, {
        short_name: nextShortName,
      })
      continue
    }

    await dishSnap.ref.update({
      short_name: nextShortName,
      updated_at: FieldValue.serverTimestamp(),
    })

    console.log('[update-dish-short-name]', dishSnap.ref.path, {
      short_name: nextShortName,
    })
  }
}

console.log('[migrate] kitchen-dish-short-names done', {
  commit,
  kitchensScanned,
  dishesScanned,
  plannedUpdates,
})
