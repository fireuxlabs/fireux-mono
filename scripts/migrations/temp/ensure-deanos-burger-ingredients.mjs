#!/usr/bin/env node
/*
  Ensure the base Deanos burger ingredients exist in the root ingredients collection.

  Scope:
  - root ingredients only
  - creates missing docs in canonical nested-stamp shape
  - lightly patches existing docs only when core canon fields are missing

  Usage:
    node scripts/migrations/temp/ensure-deanos-burger-ingredients.mjs
    node scripts/migrations/temp/ensure-deanos-burger-ingredients.mjs --commit
    node scripts/migrations/temp/ensure-deanos-burger-ingredients.mjs \
      --service-account packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json \
      --database misebox \
      --app misebox-app \
      --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from '../../_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_APP_ID = 'misebox-app'
const DEFAULT_DATABASE_ID = 'misebox'
const COLLECTION_PATH = 'ingredients'

const DEANOS_INGREDIENTS = [
  { id: 'potato-buns', name: 'Potato Buns', slug: 'potato-buns' },
  { id: 'beef-smash-patties', name: 'Beef Smash Patties', slug: 'beef-smash-patties' },
  { id: 'american-cheese', name: 'American Cheese', slug: 'american-cheese' },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', slug: 'cheddar-cheese' },
  { id: 'streaky-bacon', name: 'Streaky Bacon', slug: 'streaky-bacon' },
  { id: 'iceberg-lettuce', name: 'Iceberg Lettuce', slug: 'iceberg-lettuce' },
  { id: 'tomato', name: 'Tomato', slug: 'tomato' },
  { id: 'white-onion', name: 'White Onion', slug: 'white-onion' },
  { id: 'dill-pickles', name: 'Dill Pickles', slug: 'dill-pickles' },
  { id: 'bbq-sauce', name: 'BBQ Sauce', slug: 'bbq-sauce' },
  { id: 'yellow-mustard', name: 'Yellow Mustard', slug: 'yellow-mustard' },
  { id: 'mayonnaise', name: 'Mayonnaise', slug: 'mayonnaise' },
  { id: 'ketchup', name: 'Ketchup', slug: 'ketchup' },
]

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getNested(value, key) {
  if (!isObject(value)) return undefined
  return value[key]
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolved}`)
  }

  return {
    resolvedPath: resolved,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

function buildCreatePayload(item, appId, now) {
  return {
    name: item.name,
    slug: item.slug,
    created: {
      at: now,
      app_id: appId,
    },
    updated: {
      at: now,
    },
  }
}

function buildPatch(existing, item, appId, now) {
  const patch = {}

  if (!normalizeString(existing?.name)) patch.name = item.name
  if (!normalizeString(existing?.slug)) patch.slug = item.slug

  const created = isObject(existing?.created) ? existing.created : null
  const updated = isObject(existing?.updated) ? existing.updated : null

  if (!getNested(created, 'at')) patch['created.at'] = now
  if (!normalizeString(getNested(created, 'app_id'))) patch['created.app_id'] = appId
  if (!getNested(updated, 'at')) patch['updated.at'] = now

  return patch
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : DEFAULT_SERVICE_ACCOUNT
  const appId =
    typeof args.app === 'string'
      ? normalizeString(args.app)
      : DEFAULT_APP_ID
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DEFAULT_DATABASE_ID

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const appName = `ensure-deanos-burger-ingredients-${serviceAccount.projectId}-${Date.now()}`
  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    appName
  )

  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const now = Timestamp.now()
  const stats = {
    total: DEANOS_INGREDIENTS.length,
    created: 0,
    patched: 0,
    skipped: 0,
  }

  console.log('[migrate] ensure-deanos-burger-ingredients start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: databaseId || '(default)',
    appId,
    commit,
    total: DEANOS_INGREDIENTS.length,
  })

  for (const item of DEANOS_INGREDIENTS) {
    const ref = db.collection(COLLECTION_PATH).doc(item.id)
    const snap = await ref.get()

    if (!snap.exists) {
      const payload = buildCreatePayload(item, appId, now)
      if (commit) await ref.set(payload)
      else console.log('[dry-run][create]', ref.path, payload)
      stats.created += 1
      continue
    }

    const existing = snap.data() || {}
    const patch = buildPatch(existing, item, appId, now)
    if (!Object.keys(patch).length) {
      console.log('[skip-existing]', ref.path)
      stats.skipped += 1
      continue
    }

    if (commit) await ref.set(patch, { merge: true })
    else console.log('[dry-run][patch]', ref.path, patch)
    stats.patched += 1
  }

  console.log('[migrate] ensure-deanos-burger-ingredients done', {
    ...stats,
    commit,
  })

  if (!getApps().length) return
  await Promise.all(getApps().map(async (firebaseApp) => firebaseApp.delete()))
}

main().catch((error) => {
  console.error('[migrate] ensure-deanos-burger-ingredients failed')
  console.error(error)
  process.exit(1)
})
