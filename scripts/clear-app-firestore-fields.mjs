#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
/**
 * Clears one or more fields on a Firestore apps/{appId} doc.
 * Reads project targets from temp/app-media-audit.json.
 *
 * Example:
 *   pnpm clear:app-fields -- --ecosystem fireux --app fireux-app --fields wordmark_url
 *   pnpm clear:app-fields -- --ecosystem fireux --app fireux-app --fields wordmark_url --delete
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import admin from 'firebase-admin'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const workspaceRoot = process.cwd()
const auditPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')

const args = parseArgs(process.argv.slice(2))
const ecosystemId = String(args.ecosystem || '').trim()
const appId = String(args.app || '').trim()
const fieldsRaw = String(args.fields || '').trim()
const shouldDelete = args.delete === true

if (args.help) {
  printUsage()
  process.exit(0)
}

if (!ecosystemId || !appId || !fieldsRaw) {
  printUsage()
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
if (!projectId) {
  console.error(`Ecosystem ${ecosystemId} is missing projectId in the audit report.`)
  process.exit(1)
}

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystemId || projectId,
  projectId,
})

const fields = fieldsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = admin.initializeApp(
  {
    credential: auth.credential,
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

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/clear-app-firestore-fields.mjs --ecosystem <id> --app <appId> --fields <comma-separated> [--delete] [--service-account <path>]',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}
