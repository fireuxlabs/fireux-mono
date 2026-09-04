#!/usr/bin/env node
// @fireux-script
// last_used: 2026-09-04
// usage_note: dry-run App-to-Ecosystem reference reconciliation; add --apply to write.

import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const appId = String(args.app || '').trim()
const apply = Boolean(args.apply)
if (args.help || !appId) {
  printUsage()
  process.exit(args.help ? 0 : 1)
}

const entry = Object.values(APP_REGISTRY).find((candidate) => candidate.appId === appId)
if (!entry) throw new Error(`Unknown registered App: ${appId}`)
const target = await resolveEcosystemFirebaseTarget(entry.ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: target.ecosystemId || entry.ecosystem,
  projectId: String(args.project || target.projectId || '').trim(),
})
if (!auth.projectId) throw new Error(`Could not resolve Firebase project for ${entry.ecosystem}.`)

const appDatabaseId = String(args.database || entry.databaseId || target.databaseId).trim()
const identityDatabaseId = String(args['identity-database'] || target.databaseId || entry.ecosystem).trim()
const adminApp = initializeApp(
  { credential: auth.credential, projectId: auth.projectId },
  `reconcile-ecosystem-app-${appId}`
)
const appDb = getFirestore(adminApp, appDatabaseId)
const identityDb = getFirestore(adminApp, identityDatabaseId)
const app = await appDb.collection('apps').doc(appId).get()

let result = { action: 'none', ecosystemId: '', reason: 'App does not exist.' }
if (app.exists) {
  const ecosystemId = String(app.get('ecosystem_id') || '').trim()
  result = { action: 'none', ecosystemId, reason: 'App has no Ecosystem relationship.' }
  if (ecosystemId) {
    const ecosystem = await identityDb.collection('ecosystems').doc(ecosystemId).get()
    if (!ecosystem.exists) throw new Error(`App ${appId} references missing Ecosystem ${ecosystemId}.`)
    const reference = ecosystem.ref.collection('apps').doc(appId)
    const current = await reference.get()
    const currentData = current.data() || {}
    const matches = current.exists && currentData.app_id === appId && currentData.database_id === appDatabaseId
    result = {
      action: matches ? 'none' : current.exists ? 'repair' : 'create',
      ecosystemId,
      reason: matches ? 'Reference is aligned.' : 'Reference requires reconciliation.',
    }
    if (apply && !matches) {
      const now = FieldValue.serverTimestamp()
      await reference.set({
        app_id: appId,
        database_id: appDatabaseId,
        created: current.exists ? currentData.created || { at: now } : { at: now },
        updated: { at: now },
      })
    }
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: apply ? 'apply' : 'dry-run',
  projectId: auth.projectId,
  appId,
  appDatabaseId,
  identityDatabaseId,
  ...result,
}, null, 2))

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/reconcile-ecosystem-app-references.mjs --app <appId> [--apply]',
    '',
    'Dry-run is the default. The App root remains relationship authority.',
    ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
  ].join('\n'))
}
