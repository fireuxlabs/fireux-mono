#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: reusable Firestore tree inspection; update when run.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  firebaseCredentialScope,
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))

const explicitProjectId = String(args.project || '').trim()
const ecosystem = String(args.ecosystem || '').trim()
const explicitDatabaseId = String(args.database || '').trim()
const limit = Math.max(1, Number(args.limit || 20))
const depth = Math.max(1, Number(args.depth || 2))

if (args.help) {
  printUsage()
  process.exit(0)
}

const ecosystemTarget = await resolveEcosystemFirebaseTarget(ecosystem)
const projectIdHint = explicitProjectId || ecosystemTarget.projectId
const scope = ecosystemTarget.ecosystemId || ecosystem || projectIdHint
const auth = await resolveFirebaseAdminCredential({
  args,
  scope,
  projectId: projectIdHint,
})
const projectId = projectIdHint || auth.projectId

if (!projectId) {
  const envScope = firebaseCredentialScope(scope || 'ecosystem')
  throw new Error(
    `Could not resolve a project id. Pass --ecosystem or --project, use a credential containing project_id, or set FIREBASE_PROJECT_ID__${envScope}.`
  )
}

const adminApp = initializeApp({
  credential: auth.credential,
  projectId,
})

const db = explicitDatabaseId
  ? getFirestore(adminApp, explicitDatabaseId)
  : getFirestore(adminApp)

function sanitizeValue(value) {
  if (value == null) return value

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry))
  }

  if (typeof value !== 'object') return value

  if (
    typeof value.toDate === 'function' &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  ) {
    return {
      type: 'firestore/timestamp/1.0',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }

  if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return {
      type: 'firestore/geopoint/1.0',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }

  if (typeof value.path === 'string' && value.firestore) {
    return {
      type: 'firestore/document-reference/1.0',
      path: value.path,
    }
  }

  if (value instanceof Uint8Array) {
    return {
      type: 'bytes',
      length: value.length,
    }
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)])
  )
}

async function readCollectionTree(collectionRef, remainingDepth) {
  let count = null

  try {
    const countSnap = await collectionRef.count().get()
    count = Number(countSnap.data().count || 0)
  } catch (error) {
    count = null
  }

  const docsSnap = await collectionRef.limit(limit).get()
  const docs = []

  for (const docSnap of docsSnap.docs) {
    const node = {
      id: docSnap.id,
      data: sanitizeValue(docSnap.data()),
    }

    if (remainingDepth > 1) {
      const subcollections = await docSnap.ref.listCollections()
      if (subcollections.length) {
        node.subcollections = {}
        for (const subcollection of subcollections) {
          node.subcollections[subcollection.id] = await readCollectionTree(
            subcollection,
            remainingDepth - 1
          )
        }
      }
    }

    docs.push(node)
  }

  return {
    count,
    docs,
  }
}

const rootCollections = await db.listCollections()
const tree = {}

for (const collectionRef of rootCollections.sort((a, b) => a.id.localeCompare(b.id))) {
  tree[collectionRef.id] = await readCollectionTree(collectionRef, depth)
}

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId: explicitDatabaseId || '(default)',
      limit,
      depth,
      collections: tree,
    },
    null,
    2
  )
)

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/inspect-firestore-tree.mjs [--ecosystem <id>] [--project <projectId>] [--database <databaseId>] [--service-account <path>] [--limit 20] [--depth 2]',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}
