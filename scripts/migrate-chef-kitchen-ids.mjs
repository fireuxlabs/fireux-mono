#!/usr/bin/env node
/*
  Firestore migration: update a chef profile's kitchen_ids set.

  Defaults are preconfigured for the Daniel/Misebox correction.

  Usage:
    node scripts/migrate-chef-kitchen-ids.mjs --project <projectId> [--commit]
    node scripts/migrate-chef-kitchen-ids.mjs --project <projectId> --chef <uid> [--add id1,id2] [--remove id3] [--commit]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_CHEF_ID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const DEFAULT_REMOVE = ['ChIJGR6JR805jkcREU0bp-9yfRI']
const DEFAULT_ADD = ['ChIJ08WSgYSjj0cRD6oE3RwUFk0', 'ChIJ6RBpW5mkj0cRvErajCfCTlA']

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)

const chefId = String(args.chef || DEFAULT_CHEF_ID).trim()

function parseCsvIds(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
}

const removeIds = parseCsvIds(args.remove)
const addIds = parseCsvIds(args.add)

const resolvedRemove = removeIds.length ? removeIds : DEFAULT_REMOVE
const resolvedAdd = addIds.length ? addIds : DEFAULT_ADD

if (help) {
  console.log('\nFirestore migration: update chef kitchen_ids\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-chef-kitchen-ids.mjs --project <projectId> [--commit]')
  console.log('  node scripts/migrate-chef-kitchen-ids.mjs --project <projectId> --chef <uid> [--add id1,id2] [--remove id3] [--commit]')
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

if (!chefId) {
  console.error('Missing --chef (or default chef id).')
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

console.log('[migrate] chef-kitchen-ids start', {
  projectId,
  commit,
  chefId,
  add: resolvedAdd,
  remove: resolvedRemove,
})

const chefRef = db.collection('chefs').doc(chefId)
const chefSnap = await chefRef.get()

if (!chefSnap.exists) {
  console.error('[migrate] chef-kitchen-ids missing_chef', { chefPath: chefRef.path })
  process.exit(2)
}

const chefData = chefSnap.data() || {}
const currentKitchenIds = Array.isArray(chefData.kitchen_ids)
  ? chefData.kitchen_ids.map((value) => String(value || '').trim()).filter(Boolean)
  : []

const removeSet = new Set(resolvedRemove.map((id) => String(id || '').trim()).filter(Boolean))
const nextSet = new Set(currentKitchenIds.filter((id) => !removeSet.has(id)))
for (const id of resolvedAdd) {
  const value = String(id || '').trim()
  if (!value) continue
  nextSet.add(value)
}

const nextKitchenIds = Array.from(nextSet)

const changed =
  currentKitchenIds.length !== nextKitchenIds.length ||
  currentKitchenIds.some((id, index) => id !== nextKitchenIds[index])

console.log('[migrate] chef-kitchen-ids diff', {
  chefPath: chefRef.path,
  before: currentKitchenIds,
  after: nextKitchenIds,
  changed,
})

if (!changed) {
  console.log('[migrate] chef-kitchen-ids no_change')
  process.exit(0)
}

if (!commit) {
  console.log('[dry-run]', chefRef.path, { kitchen_ids: nextKitchenIds })
  console.log('[migrate] chef-kitchen-ids done', { commit, updated: 0 })
  process.exit(0)
}

await chefRef.update({ kitchen_ids: nextKitchenIds })

console.log('[migrate] chef-kitchen-ids done', { commit, updated: 1 })