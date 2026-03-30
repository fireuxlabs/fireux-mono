#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(args['service-account'] || '').trim()
const explicitProjectId = String(args.project || '').trim()
const appId = String(args.app || '').trim()
const ecosystemId = String(args.ecosystem || '').trim()
const docIdArg = String(args['doc-id'] || '').trim()

if (!serviceAccountPath || !appId || !ecosystemId) {
  console.error(
    'Usage: node scripts/ensure-default-project-marker.mjs --service-account <path> --app <appId> --ecosystem <ecosystemId> [--project <projectId>] [--doc-id <projectDocId>]'
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

const docId = docIdArg || projectId

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})

const db = getFirestore(adminApp)
const ref = db.collection('project').doc(docId)
const snap = await ref.get()

const current = snap.exists ? snap.data() || {} : {}
const patch = {
  main_app_id: String(current.main_app_id || '').trim() || appId,
  main_ecosystem_id: String(current.main_ecosystem_id || '').trim() || ecosystemId,
}

await ref.set(patch, { merge: true })

const finalSnap = await ref.get()

console.log(
  JSON.stringify(
    {
      ok: true,
      projectId,
      databaseId: '(default)',
      path: ref.path,
      existed: snap.exists,
      data: finalSnap.data() || null,
    },
    null,
    2
  )
)
