#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from '../_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const SYSTEM_ACTOR = 'system:backfill-place-slugs'

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const force = Boolean(args.force)
const projectId = String(args.project || DEFAULT_PROJECT_ID).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const serviceAccountPath = String(
  args['service-account'] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    DEFAULT_SERVICE_ACCOUNT_PATH
).trim()
const placeIdFilter = String(args['place-id'] || args.placeId || '').trim()
const requestedSlug = String(args.slug || '').trim()

if (args.help || args.h) {
  console.log(`
Backfill Place public slugs.

Place id remains canonical. Slug is only a clean public route locator.
Dry-run by default. Pass --commit to write.

Usage:
  node scripts/migrations/backfill-place-slugs.mjs --place-id <id> [--slug <slug>] [--commit]

Options:
  --place-id <id>           Optional single Place document id.
  --slug <slug>             Optional explicit slug for a single Place.
  --force                   Replace existing slug.
  --project <id>            Firebase project id. Defaults to misebox-78f9c.
  --database <id>           Firestore database id. Defaults to misebox.
  --service-account <path>  Service account JSON path.
`)
  process.exit(0)
}

const clean = (value) => String(value ?? '').trim()
const normalizeSlug = (value) =>
  clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const rawAccount = await readFile(serviceAccountPath, 'utf8')
const account = JSON.parse(rawAccount)
const app = initializeApp(
  { credential: cert(account), projectId },
  `backfill-place-slugs-${Date.now()}`
)
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

const refs = placeIdFilter
  ? [db.collection('places').doc(placeIdFilter)]
  : (await db.collection('places').get()).docs.map((doc) => doc.ref)

const report = {
  projectId,
  databaseId,
  placeId: placeIdFilter || '(all)',
  commit,
  force,
  inspected: 0,
  changed: 0,
  unchanged: 0,
  missing: 0,
  places: [],
}

for (const ref of refs) {
  const snap = await ref.get()

  if (!snap.exists) {
    report.missing += 1
    report.places.push({ path: ref.path, action: 'missing' })
    continue
  }

  report.inspected += 1
  const place = snap.data() || {}
  const before = clean(place.slug)
  const after = normalizeSlug(requestedSlug || place.name)

  if (!after) {
    report.unchanged += 1
    report.places.push({
      path: ref.path,
      id: snap.id,
      name: clean(place.name),
      before,
      action: 'no-slug-source',
    })
    continue
  }

  if (before && before === after) {
    report.unchanged += 1
    continue
  }

  if (before && !force) {
    report.unchanged += 1
    report.places.push({
      path: ref.path,
      id: snap.id,
      name: clean(place.name),
      before,
      after,
      action: 'kept-existing',
    })
    continue
  }

  report.changed += 1
  report.places.push({
    path: ref.path,
    id: snap.id,
    name: clean(place.name),
    before,
    after,
    action: commit ? 'updated' : 'would-update',
  })

  if (!commit) continue

  await ref.set(
    {
      slug: after,
      updated: {
        at: FieldValue.serverTimestamp(),
        by: SYSTEM_ACTOR,
      },
    },
    { merge: true }
  )
}

console.log(JSON.stringify(report, null, 2))
