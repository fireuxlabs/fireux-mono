#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_KITCHEN_COLLECTION = 'kitchens'
const SYSTEM_ACTOR = 'system:backfill-kitchen-style-shape'

const EMPTY_STYLE = {
  background_color_light: '',
  background_color_dark: '',
  font_color_light: '',
  font_color_dark: '',
  primary_color: '',
  secondary_color: '',
  title_font_source: '',
  title_font_family: '',
  font_source: '',
  font_family: '',
}

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = String(args.project || DEFAULT_PROJECT_ID).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const serviceAccountPath = String(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
).trim()
const kitchenCollection = String(
  args['kitchen-collection'] || DEFAULT_KITCHEN_COLLECTION
).trim()
const kitchenIdFilter = String(args['kitchen-id'] || args.kitchenId || '').trim()

if (args.help || args.h) {
  console.log(`
Backfill Kitchen menu_style shape.

Ensures every root Kitchen record has:
  menu_style.background_color_light
  menu_style.background_color_dark
  menu_style.font_color_light
  menu_style.font_color_dark
  menu_style.primary_color
  menu_style.secondary_color
  menu_style.title_font_source
  menu_style.title_font_family
  menu_style.font_source
  menu_style.font_family

Dry-run by default. Pass --commit to write.
`)
  process.exit(0)
}

const clean = (value) => String(value ?? '').trim()
const asRecord = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

function normalizedStyle(value) {
  const style = asRecord(value)
  return {
    background_color_light: clean(style.background_color_light),
    background_color_dark: clean(style.background_color_dark),
    font_color_light: clean(style.font_color_light),
    font_color_dark: clean(style.font_color_dark),
    primary_color: clean(style.primary_color),
    secondary_color: clean(style.secondary_color),
    title_font_source: clean(style.title_font_source),
    title_font_family: clean(style.title_font_family),
    font_source: clean(style.font_source),
    font_family: clean(style.font_family),
  }
}

function sameStyle(left, right) {
  return Object.keys(EMPTY_STYLE).every((key) => left[key] === right[key])
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `backfill-kitchen-style-shape-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const refs = kitchenIdFilter
  ? [db.collection(kitchenCollection).doc(kitchenIdFilter)]
  : (await db.collection(kitchenCollection).get()).docs.map((doc) => doc.ref)

const report = {
  projectId,
  databaseId,
  kitchenCollection,
  kitchenId: kitchenIdFilter || '(all)',
  commit,
  inspected: 0,
  changed: 0,
  unchanged: 0,
  missing: 0,
  kitchens: [],
}

for (const ref of refs) {
  const snap = await ref.get()

  if (!snap.exists) {
    report.missing += 1
    report.kitchens.push({ path: ref.path, action: 'missing' })
    continue
  }

  report.inspected += 1
  const data = snap.data() || {}
  const before = data.menu_style ?? data.style ?? null
  const after = normalizedStyle(before)

  if (sameStyle(asRecord(before), after)) {
    report.unchanged += 1
    continue
  }

  report.changed += 1
  report.kitchens.push({
    path: ref.path,
    id: snap.id,
    display_name: clean(data.display_name) || clean(data.slug),
    before,
    after,
  })

  if (!commit) continue

  await ref.set(
    {
      menu_style: after,
      style: FieldValue.delete(),
      updated: {
        at: FieldValue.serverTimestamp(),
        by: SYSTEM_ACTOR,
      },
    },
    { merge: true }
  )
}

console.log(JSON.stringify(report, null, 2))
