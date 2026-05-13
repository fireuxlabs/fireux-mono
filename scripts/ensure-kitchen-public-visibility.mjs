#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
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
const SYSTEM_ACTOR = 'system:ensure-kitchen-public-visibility'
const VISIBLE_KITCHEN_SLUGS = new Set(['la-tapberne'])

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

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function printHelp() {
  console.log(`
Ensure public kitchen visibility.

Dry-run by default. Pass --commit to write.

Canon:
  show: true  -> listed on /kitchens
  show: false -> hidden from /kitchens, direct routes still work

Usage:
  node scripts/ensure-kitchen-public-visibility.mjs [--commit]

Options:
  --commit                         Write visibility fixes.
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

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)

  const app = initializeApp(
    { credential: cert(account), projectId },
    'ensure-kitchen-public-visibility'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const snap = await db.collection(kitchenCollectionPath).get()
  const plans = snap.docs.map((docSnap) => {
    const data = docSnap.data() || {}
    const slug = normalizeString(data.slug)
    const currentShow = data.show === true
    const nextShow = VISIBLE_KITCHEN_SLUGS.has(slug)

    return {
      ref: docSnap.ref,
      id: docSnap.id,
      slug,
      name: normalizeString(data.name || data.display_name),
      from: currentShow,
      to: nextShow,
      needsWrite:
        !Object.prototype.hasOwnProperty.call(data, 'show') ||
        currentShow !== nextShow,
    }
  })
  const writes = plans.filter((plan) => plan.needsWrite)

  console.log('[visibility] kitchen-public-visibility start', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenCollectionPath,
    kitchenCount: snap.size,
    plannedWriteCount: writes.length,
    visibleSlugs: Array.from(VISIBLE_KITCHEN_SLUGS),
  })

  plans.forEach((plan) => {
    console.log(plan.needsWrite ? (commit ? '[write]' : '[dry-run]') : '[ok]', {
      id: plan.id,
      slug: plan.slug || null,
      name: plan.name || null,
      from: plan.from,
      to: plan.to,
    })
  })

  if (commit && writes.length) {
    let batch = db.batch()
    let batchOps = 0

    for (const plan of writes) {
      batch.set(
        plan.ref,
        {
          show: plan.to,
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

  console.log('[visibility] kitchen-public-visibility done', {
    commit,
    written: commit ? writes.length : 0,
    plannedWriteCount: writes.length,
    visible: plans
      .filter((plan) => plan.to)
      .map((plan) => ({ id: plan.id, slug: plan.slug, name: plan.name })),
    hiddenCount: plans.filter((plan) => !plan.to).length,
  })
}

main().catch((error) => {
  console.error('[visibility] kitchen-public-visibility failed')
  console.error(error)
  process.exitCode = 1
})
