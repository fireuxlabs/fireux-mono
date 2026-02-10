#!/usr/bin/env node
/*
  Deletes duplicate ingredient documents by id.

  Usage:
    node scripts/delete-duplicate-ingredients.mjs --project <projectId>          (dry-run)
    node scripts/delete-duplicate-ingredients.mjs --project <projectId> --commit

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)

const idsToDelete = [
  '3COhy9KZU5yelq08HvZx',
  'EZQU6kv6cnnVg20lqQpo',
  'Pp2zGemsNhi6zW58fOFj',
  'YQ9Oi5Jd9IclhElHvVYX',
  'YiEySWR2eEsadcoYsCLz',
  'cc2xKU4FbCeZm5mv0pWW',
  'oAjH2J6d7AWdGOtEcfmk',
  'rxRjlOJYXR9Z0q7Nq31W',
  'tz9pN7sTBVeOIMtnHgp1',
  'wZ6yS0vxqOTnkdFenM3W',
]

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

console.log('[delete-duplicate-ingredients]', {
  projectId,
  commit,
  count: idsToDelete.length,
})

if (!commit) {
  console.log('Dry-run: would delete the following ingredient ids:')
  for (const id of idsToDelete) console.log(`- ${id}`)
  process.exit(0)
}

const batch = db.batch()
for (const id of idsToDelete) {
  const ref = db.collection('ingredients').doc(id)
  batch.delete(ref)
}

await batch.commit()
console.log(`Deleted ${idsToDelete.length} ingredient documents.`)
