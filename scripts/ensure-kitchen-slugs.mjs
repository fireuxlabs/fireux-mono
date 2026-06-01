#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:ensure-kitchen-slugs'
const SLUG_MAX_LENGTH = 80
const CANONICAL_SLUG_BY_KITCHEN_ID = new Map([
  ['ChIJ08WSgYSjj0cRD6oE3RwUFk0', 'la-tapberne'],
])

const normalizeString = (value) => String(value ?? '').trim()

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let index = 0; index < 12; index += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

function normalizeSlug(value) {
  return normalizeString(value)
    .replace(/\u00c4/g, 'Ae')
    .replace(/\u00d6/g, 'Oe')
    .replace(/\u00dc/g, 'Ue')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .replace(/\u00c6/g, 'Ae')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u0152/g, 'Oe')
    .replace(/\u0153/g, 'oe')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^@+/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '')
}

function withSlugSuffix(baseSlug, index) {
  const suffix = `-${index}`
  const maxBaseLength = SLUG_MAX_LENGTH - suffix.length
  const base = baseSlug.slice(0, maxBaseLength).replace(/-+$/g, '') || 'kitchen'
  return `${base}${suffix}`
}

function pickSlugBase(docSnap, place) {
  const data = docSnap.data() || {}

  if (CANONICAL_SLUG_BY_KITCHEN_ID.has(docSnap.id)) {
    return CANONICAL_SLUG_BY_KITCHEN_ID.get(docSnap.id)
  }

  return (
    normalizeString(data.slug) ||
    normalizeString(data.name) ||
    normalizeString(data.short_name) ||
    normalizeString(place?.slug) ||
    normalizeString(place?.name) ||
    normalizeString(place?.short_name) ||
    normalizeString(data.display_name) ||
    normalizeString(data.place_name) ||
    docSnap.id
  )
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function printHelp() {
  console.log(`
Ensure every kitchen has one canonical unique slug.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/ensure-kitchen-slugs.mjs [--commit]

Options:
  --commit                         Write slug fixes.
  --project <id>                   Firebase project id. Defaults to misebox-78f9c.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const commit = Boolean(args.commit)
  const projectId =
    normalizeString(args.project) ||
    normalizeString(process.env.FIREBASE_PROJECT_ID) ||
    DEFAULT_PROJECT_ID
  const databaseId =
    normalizeString(args.database) ||
    normalizeString(process.env.FIRESTORE_DATABASE_ID) ||
    DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    normalizeString(args['kitchen-collection']) || DEFAULT_KITCHEN_COLLECTION_PATH
  const serviceAccountPath =
    normalizeString(args['service-account']) ||
    normalizeString(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)

  initializeApp({
    credential: cert(account),
    projectId,
  })

  const db = getFirestore(databaseId)
  const snap = await db
    .collection(kitchenCollectionPath)
    .orderBy(FieldPath.documentId())
    .get()
  const placeRefsById = new Map()

  for (const docSnap of snap.docs) {
    const data = docSnap.data() || {}
    const placeId =
      normalizeString(data.place_id) ||
      normalizeString(data.google_place_id) ||
      docSnap.id

    if (!placeId || placeRefsById.has(placeId)) continue
    placeRefsById.set(placeId, db.collection('places').doc(placeId))
  }

  const placeSnaps = placeRefsById.size
    ? await db.getAll(...Array.from(placeRefsById.values()))
    : []
  const placesById = new Map(
    placeSnaps
      .filter((placeSnap) => placeSnap.exists)
      .map((placeSnap) => [placeSnap.id, placeSnap.data() || {}])
  )

  const usedSlugs = new Map()
  const plans = []

  for (const docSnap of snap.docs) {
    const data = docSnap.data() || {}
    const placeId =
      normalizeString(data.place_id) ||
      normalizeString(data.google_place_id) ||
      docSnap.id
    const place = placesById.get(placeId) || null
    const currentSlug = normalizeString(data.slug)
    const baseText = pickSlugBase(docSnap, place)
    const baseSlug = normalizeSlug(baseText) || normalizeSlug(docSnap.id)
    let nextSlug = baseSlug || 'kitchen'
    let suffix = 2

    while (usedSlugs.has(nextSlug)) {
      nextSlug = withSlugSuffix(baseSlug || 'kitchen', suffix)
      suffix += 1
    }

    usedSlugs.set(nextSlug, docSnap.id)

    const hasAliasField =
      Object.prototype.hasOwnProperty.call(data, 'slug_aliases') ||
      Object.prototype.hasOwnProperty.call(data, 'slugAliases')

    const needsSlugUpdate = currentSlug !== nextSlug
    if (!needsSlugUpdate && !hasAliasField) continue

    plans.push({
      id: docSnap.id,
      path: docSnap.ref.path,
      from: currentSlug,
      to: nextSlug,
      basis: baseText,
      placeId,
      hadAliases: hasAliasField,
      ref: docSnap.ref,
    })
  }

  console.log('[ensure-kitchen-slugs] start', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenCollectionPath,
    kitchenCount: snap.size,
    plannedWriteCount: plans.length,
  })

  plans.forEach((plan) => {
    console.log(commit ? '[write]' : '[dry-run]', {
      id: plan.id,
      path: plan.path,
      from: plan.from || null,
      to: plan.to,
      basis: plan.basis,
      placeId: plan.placeId,
      removeAliases: plan.hadAliases,
    })
  })

  if (commit && plans.length) {
    let batch = db.batch()
    let batchOps = 0

    for (const plan of plans) {
      batch.set(
        plan.ref,
        {
          slug: plan.to,
          slug_aliases: FieldValue.delete(),
          slugAliases: FieldValue.delete(),
          updated: updatedStamp(),
        },
        { merge: true }
      )
      batchOps += 1

      if (batchOps >= 450) {
        await batch.commit()
        batch = db.batch()
        batchOps = 0
      }
    }

    if (batchOps) await batch.commit()
  }

  console.log('[ensure-kitchen-slugs] summary', {
    commit,
    kitchenCount: snap.size,
    plannedWriteCount: plans.length,
    writtenCount: commit ? plans.length : 0,
    uniqueSlugCount: usedSlugs.size,
  })
}

main().catch((error) => {
  console.error('[ensure-kitchen-slugs] failed')
  console.error(error)
  process.exitCode = 1
})
