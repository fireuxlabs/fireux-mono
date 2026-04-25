#!/usr/bin/env node
/*
  Ensure root ingredient docs exist in canonical nested-stamp shape.

  Default target:
  - Firebase project: misebox-78f9c
  - Firestore database: misebox
  - App id stamp: misebox-app

  Input modes:
  - --names "House Pickles, House Sauce"
  - --payload '[{"name":"House Pickles"},{"name":"House Sauce","image_url":"https://..."}]'
  - --payloadFile path/to/ingredients.json

  Payload shape:
  [
    "House Pickles",
    { "name": "House Sauce" },
    { "id": "house-sauce", "name": "House Sauce", "slug": "house-sauce", "image_url": "https://..." }
  ]

  Dry-run by default. Pass --commit to write.

  Usage:
    node scripts/migrations/ensure-root-ingredients.mjs --names "House Pickles, House Sauce"
    node scripts/migrations/ensure-root-ingredients.mjs --payloadFile ./tmp/ingredients.json --commit
    node scripts/migrations/ensure-root-ingredients.mjs \
      --service-account packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json \
      --database misebox \
      --app misebox-app \
      --names "House Pickles, House Sauce" \
      --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from '../_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_APP_ID = 'misebox-app'
const DEFAULT_DATABASE_ID = 'misebox'
const COLLECTION_PATH = 'ingredients'

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

function toSlug(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function parseNamesCsv(value) {
  return normalizeString(value)
    .split(/[,\n]/g)
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
    .map((name) => ({ name }))
}

function normalizeIngredientInput(item) {
  if (typeof item === 'string') {
    const name = normalizeString(item)
    const id = toSlug(name)
    return name && id ? { id, name, slug: id, image_url: '' } : null
  }

  if (!isObject(item)) return null

  const name = normalizeString(item.name)
  const id = normalizeString(item.id) || toSlug(normalizeString(item.slug) || name)
  const slug = normalizeString(item.slug) || id
  const image_url = normalizeString(item.image_url)

  if (!name || !id) return null

  return {
    id,
    name,
    slug,
    image_url,
  }
}

async function readPayloadInput(args) {
  const payloadInline = typeof args.payload === 'string' ? args.payload : ''
  const payloadFile = typeof args.payloadFile === 'string' ? args.payloadFile : ''
  const namesArg = typeof args.names === 'string' ? args.names : ''

  let items = []

  if (namesArg) {
    items = items.concat(parseNamesCsv(namesArg))
  }

  if (payloadInline) {
    const parsed = JSON.parse(payloadInline)
    if (!Array.isArray(parsed)) throw new Error('--payload must be a JSON array.')
    items = items.concat(parsed)
  }

  if (payloadFile) {
    const raw = await readFile(resolve(REPO_ROOT, payloadFile), 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('--payloadFile must contain a JSON array.')
    items = items.concat(parsed)
  }

  return uniqueById(
    items
      .map((item) => normalizeIngredientInput(item))
      .filter(Boolean)
  )
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
  const payload = {
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

  if (item.image_url) payload.image_url = item.image_url
  return payload
}

function buildPatch(existing, item, appId, now) {
  const patch = {}

  if (!normalizeString(existing?.name)) patch.name = item.name
  if (!normalizeString(existing?.slug)) patch.slug = item.slug
  if (item.image_url && !normalizeString(existing?.image_url)) patch.image_url = item.image_url

  const created = isObject(existing?.created) ? existing.created : null
  const updated = isObject(existing?.updated) ? existing.updated : null

  if (!getNested(created, 'at')) patch['created.at'] = now
  if (!normalizeString(getNested(created, 'app_id'))) patch['created.app_id'] = appId
  if (!getNested(updated, 'at')) patch['updated.at'] = now

  return patch
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const help = Boolean(args.help || args.h)
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

  if (help) {
    console.log('\nEnsure root ingredients\n')
    console.log('Input:')
    console.log('  --names "House Pickles, House Sauce"')
    console.log('  --payload <json-array>')
    console.log('  --payloadFile <path>')
    console.log('Optional:')
    console.log('  --service-account <path>')
    console.log('  --database <databaseId>')
    console.log('  --app <appId>')
    console.log('  --commit')
    process.exit(0)
  }

  const items = await readPayloadInput(args)
  if (!items.length) {
    console.error('No ingredient inputs found. Use --names, --payload, or --payloadFile.')
    process.exit(1)
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const appName = `ensure-root-ingredients-${serviceAccount.projectId}-${Date.now()}`
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
    total: items.length,
    created: 0,
    patched: 0,
    skipped: 0,
  }

  console.log('[migrate] ensure-root-ingredients start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: databaseId || '(default)',
    appId,
    commit,
    total: items.length,
  })

  for (const item of items) {
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

  console.log('[migrate] ensure-root-ingredients done', {
    ...stats,
    commit,
  })

  if (!getApps().length) return
  await Promise.all(getApps().map(async (firebaseApp) => firebaseApp.delete()))
}

main().catch((error) => {
  console.error('[migrate] ensure-root-ingredients failed')
  console.error(error)
  process.exit(1)
})
