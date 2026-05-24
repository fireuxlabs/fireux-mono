#!/usr/bin/env node

/*
  Migrates Ecosystem root docs from the old singular collection to canon plural.

  Source: ecosystem/{ecosystemId}
  Target: ecosystems/{ecosystemId}

  Dry-run by default. Pass --commit to write target docs.
*/

import { readFile } from 'node:fs/promises'
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from '../_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'

const serviceAccountPath = String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT).trim()
const databaseId = String(args.database || 'fireux').trim()
const commit = Boolean(args.commit)
const overwrite = Boolean(args.overwrite)

const rawServiceAccount = await readFile(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawServiceAccount)
const projectId = String(args.project || serviceAccount.project_id || '').trim()

if (!projectId) {
  console.error('[ecosystems-plural] Could not resolve Firebase project id.')
  process.exit(2)
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})

const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
const sourceSnap = await db.collection('ecosystem').get()

let copied = 0
let skipped = 0
let existing = 0

console.log('[ecosystems-plural] start', {
  projectId,
  databaseId: databaseId || '(default)',
  source: 'ecosystem',
  target: 'ecosystems',
  docs: sourceSnap.size,
  commit,
  overwrite,
})

for (const docSnap of sourceSnap.docs) {
  const targetRef = db.collection('ecosystems').doc(docSnap.id)
  const targetSnap = await targetRef.get()

  if (targetSnap.exists && !overwrite) {
    existing += 1
    console.log('[skip-existing]', targetRef.path)
    continue
  }

  const data = docSnap.data() || {}
  const patch = {
    ...data,
    id: String(data.id || docSnap.id).trim(),
    updated: {
      ...(data.updated && typeof data.updated === 'object' && !Array.isArray(data.updated)
        ? data.updated
        : {}),
      at: FieldValue.serverTimestamp(),
      by: 'system:migrate-ecosystems-collection-plural',
    },
  }

  copied += 1

  if (!commit) {
    console.log('[dry-run] set', targetRef.path, {
      id: patch.id,
      slug: patch.slug,
      name: patch.name,
      status: patch.status,
    })
    continue
  }

  await targetRef.set(patch, { merge: true })
}

if (!sourceSnap.size) skipped = 1

console.log('[ecosystems-plural] done', {
  copied,
  existing,
  skipped,
  commit,
})
