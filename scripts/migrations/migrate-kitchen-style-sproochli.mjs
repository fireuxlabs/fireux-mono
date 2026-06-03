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
const SYSTEM_ACTOR = 'system:migrate-kitchen-style-sproochli'

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
Migrate Kitchen style/Sproochli parked data.

Moves old root Kitchen menu/language styling fields into:
  style
  sproochli_migrate

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/migrate-kitchen-style-sproochli.mjs [--commit]

Options:
  --kitchen-id <id>          Optional single kitchen id.
  --project <id>             Firebase project id. Defaults to misebox-78f9c.
  --database <id>            Firestore database id. Defaults to misebox.
  --service-account <path>   Service account JSON path.
  --kitchen-collection <id>  Kitchen collection. Defaults to kitchens.
`)
  process.exit(0)
}

const clean = (value) => String(value ?? '').trim()
const asRecord = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null

function stylePayload(kitchen) {
  const existing = asRecord(kitchen.style) || {}
  const designPacks = asRecord(kitchen.design_packs)
  const publicMenu = asRecord(designPacks?.public_menu)
  const accent = clean(publicMenu?.accent)

  return {
    background_color_light: clean(existing.background_color_light),
    background_color_dark: clean(existing.background_color_dark),
    font_color_light: clean(existing.font_color_light),
    font_color_dark: clean(existing.font_color_dark),
    primary_color: clean(existing.primary_color) || accent,
    secondary_color: clean(existing.secondary_color),
  }
}

function sproochliMigratePayload(kitchen) {
  const parked = asRecord(kitchen.sproochli_migrate) || {}
  const payload = { ...parked }

  const primaryLanguage = clean(kitchen.primary_language)
  const languageSettings = asRecord(kitchen.language_settings)
  const design = asRecord(kitchen.design)
  const designPacks = asRecord(kitchen.design_packs)

  if (primaryLanguage) payload.primary_language = primaryLanguage
  if (languageSettings) payload.language_settings = languageSettings
  if (design) payload.design = design
  if (designPacks) payload.design_packs = designPacks

  return payload
}

function hasPayload(value) {
  return asRecord(value) && Object.keys(value).length > 0
}

function hasOldFields(kitchen) {
  return Boolean(
    clean(kitchen.primary_language) ||
      kitchen.language_settings ||
      kitchen.design ||
      kitchen.design_packs
  )
}

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `migrate-kitchen-style-sproochli-${Date.now()}`
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
  kitchens: [],
}

for (const ref of refs) {
  const snap = await ref.get()
  if (!snap.exists) {
    report.kitchens.push({
      path: ref.path,
      action: 'missing',
    })
    continue
  }

  report.inspected += 1
  const kitchen = snap.data() || {}
  const style = stylePayload(kitchen)
  const sproochliMigrate = sproochliMigratePayload(kitchen)
  const shouldChange = hasOldFields(kitchen)

  if (!shouldChange) {
    report.unchanged += 1
    continue
  }

  report.changed += 1
  report.kitchens.push({
    path: ref.path,
    id: snap.id,
    name: clean(kitchen.name) || clean(kitchen.slug),
    style,
    sproochli_migrate: sproochliMigrate,
    removed: [
      clean(kitchen.primary_language) ? 'primary_language' : '',
      kitchen.language_settings ? 'language_settings' : '',
      kitchen.design ? 'design' : '',
      kitchen.design_packs ? 'design_packs' : '',
    ].filter(Boolean),
  })

  if (!commit) continue

  const payload = {
    style,
    updated: {
      at: FieldValue.serverTimestamp(),
      by: SYSTEM_ACTOR,
    },
    primary_language: FieldValue.delete(),
    language_settings: FieldValue.delete(),
    design: FieldValue.delete(),
    design_packs: FieldValue.delete(),
  }

  if (hasPayload(sproochliMigrate)) {
    payload.sproochli_migrate = sproochliMigrate
  }

  await ref.set(payload, { merge: true })
}

console.log(JSON.stringify(report, null, 2))
