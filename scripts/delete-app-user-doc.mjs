#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(args['service-account'] || '').trim()
const appId = String(args.app || '').trim()
const uid = String(args.uid || '').trim()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()

if (!serviceAccountPath || !appId || !uid) {
  console.error(
    'Usage: node scripts/delete-app-user-doc.mjs --service-account <path> --app <appId> --uid <uid> [--project <projectId>] [--database <databaseId>]'
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

const ref = db.collection('apps').doc(appId).collection('users').doc(uid)
await ref.delete()

console.log(
  JSON.stringify(
    {
      ok: true,
      projectId,
      databaseId: explicitDatabaseId || '(default)',
      path: ref.path,
    },
    null,
    2
  )
)
