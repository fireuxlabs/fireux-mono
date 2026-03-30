#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(args['service-account'] || '').trim()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()
const limit = Math.max(1, Number(args.limit || 20))
const depth = Math.max(1, Number(args.depth || 2))

if (!serviceAccountPath) {
  console.error(
    'Usage: node scripts/inspect-firestore-tree.mjs --service-account <path> [--project <projectId>] [--database <databaseId>] [--limit 20] [--depth 2]'
  )
  process.exit(1)
}

const rawServiceAccount = await readFile(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawServiceAccount)
const projectId =
  explicitProjectId ||
  String(serviceAccount.project_id || '').trim()

if (!projectId) {
  console.error('Could not resolve project id from --project or service account.')
  process.exit(1)
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
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
