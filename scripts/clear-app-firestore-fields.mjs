#!/usr/bin/env node
/**
 * Clears one or more fields on a Firestore apps/{appId} doc.
 * Uses the per-ecosystem service account from temp/app-media-audit.json.
 *
 * Example:
 *   pnpm clear:app-fields -- --ecosystem fireux --app fireux-app --fields wordmark_url
 *   pnpm clear:app-fields -- --ecosystem fireux --app fireux-app --fields wordmark_url --delete
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import admin from 'firebase-admin'

const workspaceRoot = process.cwd()
const auditPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')

const argv = process.argv.slice(2)
const flagValue = (name) => {
  const idx = argv.indexOf(name)
  if (idx === -1) return null
  return argv[idx + 1] ?? null
}

const ecosystemId = flagValue('--ecosystem')
const appId = flagValue('--app')
const fieldsRaw = flagValue('--fields')
const shouldDelete = argv.includes('--delete')

if (!ecosystemId || !appId || !fieldsRaw) {
  console.error('Usage: --ecosystem <id> --app <appId> --fields <comma-separated>')
  process.exit(1)
}

if (!fs.existsSync(auditPath)) {
  console.error(`Missing ${auditPath}. Run pnpm audit:app-media first.`)
  process.exit(1)
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
const eco = audit?.ecosystems?.[ecosystemId]
if (!eco) {
  console.error(`Unknown ecosystem ${ecosystemId} in ${path.relative(workspaceRoot, auditPath)}`)
  process.exit(1)
}

const projectId = eco.projectId
const serviceAccountRel = eco.serviceAccount
if (!projectId || !serviceAccountRel) {
  console.error(`Ecosystem ${ecosystemId} missing projectId/serviceAccount in audit report.`)
  process.exit(1)
}

const serviceAccountPath = path.join(workspaceRoot, serviceAccountRel)
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Missing service account: ${serviceAccountRel}`)
  process.exit(1)
}

const fields = fieldsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = admin.initializeApp(
  {
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
    ),
    projectId,
  },
  `clear-${ecosystemId}-${appId}`
)

const firestore = app.firestore()

const patch = {}
for (const f of fields) {
  patch[f] = shouldDelete ? admin.firestore.FieldValue.delete() : ''
}

await firestore.collection('apps').doc(appId).set(patch, { merge: true })

console.log(
  `Updated apps/${appId} in ${ecosystemId}: ${shouldDelete ? 'deleted' : 'cleared'} ${fields.join(', ')}`
)
