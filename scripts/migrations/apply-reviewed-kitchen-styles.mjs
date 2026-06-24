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
const SYSTEM_ACTOR = 'system:apply-reviewed-kitchen-styles'

const REVIEWED_STYLES = [
  {
    id: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
    name: 'La Tapberne',
    source: 'physical menu photo review',
    menuStyle: {
      background_color_light: '#F4E8D2',
      background_color_dark: '#171717',
      font_color_light: '#1F1A14',
      font_color_dark: '#F7F1E6',
      title_color_light: '#1F1A14',
      title_color_dark: '#F7F1E6',
      primary_color: '#9C2C18',
      secondary_color: '#E99F5E',
    },
  },
  {
    id: 'bergwelt-grindelwald',
    name: 'Bergwelt Grindelwald',
    source: 'physical menu PDF review',
    menuStyle: {
      background_color_light: '#F7F7F5',
      background_color_dark: '#3D3F41',
      font_color_light: '#57585A',
      font_color_dark: '#F7F7F5',
      primary_color: '#3D3F41',
      secondary_color: '#B8B8B8',
    },
  },
  {
    id: 'ChIJ93_ggY-jj0cRTCyLcfBuK2w',
    name: 'Luna Piccante',
    source: 'physical menu PDF review',
    menuStyle: {
      background_color_light: '#FFFDF7',
      background_color_dark: '#2D2B20',
      font_color_light: '#111111',
      font_color_dark: '#FFFDF7',
      primary_color: '#C81010',
      secondary_color: '#568B44',
      title_font_source: 'google',
      title_font_family: 'Playfair Display',
      font_source: 'google',
      font_family: 'Lora',
    },
  },
]

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const kitchenIdFilter = String(args['kitchen-id'] || args.kitchenId || '').trim()
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

if (args.help || args.h) {
  console.log(`
Apply reviewed Kitchen menu_style values.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/apply-reviewed-kitchen-styles.mjs [--commit]

Options:
  --kitchen-id <id>          Optional single reviewed kitchen id.
  --project <id>             Firebase project id. Defaults to misebox-78f9c.
  --database <id>            Firestore database id. Defaults to misebox.
  --service-account <path>   Service account JSON path.
  --kitchen-collection <id>  Kitchen collection. Defaults to kitchens.
`)
  process.exit(0)
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `apply-reviewed-kitchen-styles-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const reviewedStyles = kitchenIdFilter
  ? REVIEWED_STYLES.filter((entry) => entry.id === kitchenIdFilter)
  : REVIEWED_STYLES

const report = {
  projectId,
  databaseId,
  kitchenCollection,
  kitchenId: kitchenIdFilter || '(all reviewed)',
  commit,
  inspected: reviewedStyles.length,
  changed: 0,
  missing: 0,
  kitchens: [],
}

for (const entry of reviewedStyles) {
  const ref = db.collection(kitchenCollection).doc(entry.id)
  const snap = await ref.get()

  if (!snap.exists) {
    report.missing += 1
    report.kitchens.push({
      path: ref.path,
      id: entry.id,
      name: entry.name,
      action: 'missing',
    })
    continue
  }

  const current = snap.data() || {}
  const currentStyle = current.menu_style || current.style || null
  report.changed += 1
  report.kitchens.push({
    path: ref.path,
    id: entry.id,
    display_name: current.display_name || current.name || entry.name,
    source: entry.source,
    before: currentStyle,
    after: entry.menuStyle,
  })

  if (!commit) continue

  await ref.set(
    {
      menu_style: entry.menuStyle,
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
