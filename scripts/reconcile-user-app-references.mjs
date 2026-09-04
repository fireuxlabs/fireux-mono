#!/usr/bin/env node
// @fireux-script
// last_used: 2026-09-04
// usage_note: dry-run AppUser-to-User reference reconciliation; add --apply to write.

import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import {
  firebaseAdminCredentialHelp,
  firebaseCredentialScope,
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const appId = String(args.app || '').trim()
const apply = Boolean(args.apply)
const explicitProjectId = String(args.project || '').trim()
const explicitAppDatabaseId = String(args.database || '').trim()
const explicitIdentityDatabaseId = String(args['identity-database'] || '').trim()

if (args.help || !appId) {
  printUsage()
  process.exit(args.help ? 0 : 1)
}

const entry = Object.values(APP_REGISTRY).find((candidate) => candidate.appId === appId)
if (!entry) throw new Error(`Unknown registered App: ${appId}`)

const ecosystemTarget = await resolveEcosystemFirebaseTarget(entry.ecosystem)
const projectIdHint = explicitProjectId || ecosystemTarget.projectId
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystemTarget.ecosystemId || entry.ecosystem,
  projectId: projectIdHint,
})
const projectId = projectIdHint || auth.projectId

if (!projectId) {
  const scope = firebaseCredentialScope(ecosystemTarget.ecosystemId || entry.ecosystem)
  throw new Error(
    `Could not resolve a project id. Pass --project or configure FIREBASE_PROJECT_ID__${scope}.`
  )
}

const appDatabaseId = explicitAppDatabaseId || entry.databaseId || entry.ecosystem
const identityDatabaseId = explicitIdentityDatabaseId || entry.ecosystem
const adminApp = initializeApp(
  { credential: auth.credential, projectId },
  `reconcile-user-app-${appId}`
)
const appDb = getFirestore(adminApp, appDatabaseId)
const identityDb = getFirestore(adminApp, identityDatabaseId)
const memberships = await appDb
  .collection('apps')
  .doc(appId)
  .collection('users')
  .get()

const changes = []
for (const membership of memberships.docs) {
  const reference = identityDb
    .collection('users')
    .doc(membership.id)
    .collection('apps')
    .doc(appId)
  const current = await reference.get()
  const currentData = current.data() || {}
  const matches =
    current.exists &&
    currentData.app_id === appId &&
    currentData.database_id === appDatabaseId

  if (matches) continue
  changes.push({ userId: membership.id, action: current.exists ? 'repair' : 'create' })

  if (apply) {
    const now = FieldValue.serverTimestamp()
    await reference.set({
      app_id: appId,
      database_id: appDatabaseId,
      created: current.exists ? currentData.created || { at: now } : { at: now },
      updated: { at: now },
    })
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: apply ? 'apply' : 'dry-run',
  projectId,
  appId,
  appDatabaseId,
  identityDatabaseId,
  membershipCount: memberships.size,
  changeCount: changes.length,
  changes,
}, null, 2))

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/reconcile-user-app-references.mjs --app <appId> [--apply]',
    '    [--project <projectId>] [--database <appDatabaseId>]',
    '    [--identity-database <identityDatabaseId>] [--service-account <path>]',
    '',
    'Dry-run is the default. --apply creates or repairs references for existing AppUsers.',
    'It never creates AppUsers and never treats references as membership authority.',
    '',
    'Credential sources, in precedence order:',
    ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
  ].join('\n'))
}
