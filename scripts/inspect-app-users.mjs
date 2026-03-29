#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(args['service-account'] || '').trim()
const appId = String(args.app || '').trim()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()
const limit = Math.max(1, Number(args.limit || 10))

if (!serviceAccountPath || !appId) {
  console.error(
    'Usage: node scripts/inspect-app-users.mjs --service-account <path> --app <appId> [--project <projectId>] [--database <databaseId>] [--limit 10]'
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

const [usersSnap, appUsersSnap] = await Promise.all([
  db.collection('users').limit(limit).get(),
  db.collection('apps').doc(appId).collection('users').limit(limit).get(),
])

const users = usersSnap.docs.map((doc) => ({
  id: doc.id,
  display_name: doc.get('display_name') || '',
  email: doc.get('email') || '',
  handle: doc.get('handle') || '',
}))

const appUsers = appUsersSnap.docs.map((doc) => ({
  id: doc.id,
  role: doc.get('role') || '',
  is_premium: doc.get('is_premium') === true,
}))

console.log(
  JSON.stringify(
    {
      projectId,
      databaseId: explicitDatabaseId || '(default)',
      appId,
      users,
      appUsers,
    },
    null,
    2
  )
)
