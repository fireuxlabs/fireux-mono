#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: reusable app/user identity inspection; update when run.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()
const limit = Math.max(1, Number(args.limit || 10))
const identityScan = Boolean(args['identity-scan'])
const explicitEcosystem = String(args.ecosystem || '').trim()
const roles = String(args.roles || 'tenant,standalone')
  .split(',')
  .map((role) => role.trim())
  .filter(Boolean)

if (args.help) {
  printUsage()
  process.exit(0)
}

if (identityScan) {
  if (explicitProjectId && !explicitEcosystem) {
    throw new Error(
      '--identity-scan may use --project only when --ecosystem limits the scan to one ecosystem.'
    )
  }

  const result = await inspectRegistryIdentity({
    args,
    roles,
    limit,
    explicitProjectId,
    ecosystem: explicitEcosystem,
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

if (!appId) {
  printUsage()
  process.exit(1)
}

const registryEntry = Object.values(APP_REGISTRY).find((entry) => entry.appId === appId)
const ecosystem = String(explicitEcosystem || registryEntry?.ecosystem || '').trim()
const ecosystemTarget = await resolveEcosystemFirebaseTarget(ecosystem)
const projectIdHint = explicitProjectId || ecosystemTarget.projectId
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystemTarget.ecosystemId || ecosystem || projectIdHint,
  projectId: projectIdHint,
})
const projectId = projectIdHint || auth.projectId

if (!projectId) {
  const scope = firebaseCredentialScope(
    ecosystemTarget.ecosystemId || ecosystem || appId
  )
  throw new Error(
    `Could not resolve a project id. Pass --project, configure the ecosystem projectId, or set FIREBASE_PROJECT_ID__${scope}.`
  )
}

const adminApp = initializeApp({
  credential: auth.credential,
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

async function inspectRegistryIdentity(options) {
  const selectedRoles = new Set(options.roles)
  const selectedEcosystem = String(options.ecosystem || '').trim()
    .replace(/^fireux-/, '')
  const entries = Object.values(APP_REGISTRY)
    .filter((entry) => selectedRoles.has(entry.role))
    .filter((entry) =>
      selectedEcosystem ? entry.ecosystem === selectedEcosystem : true
    )
    .sort((a, b) => a.launchOrder - b.launchOrder)

  const appCache = new Map()
  const dbCache = new Map()

  async function adminAppForEcosystem(ecosystem) {
    const key = String(ecosystem || '').trim()
    if (appCache.has(key)) return appCache.get(key)

    const ecosystemTarget = await resolveEcosystemFirebaseTarget(key)
    const projectIdHint = options.explicitProjectId || ecosystemTarget.projectId
    const auth = await resolveFirebaseAdminCredential({
      args: options.args,
      scope: ecosystemTarget.ecosystemId || key,
      projectId: projectIdHint,
    })
    if (!auth.projectId) {
      const scope = firebaseCredentialScope(ecosystemTarget.ecosystemId || key)
      throw new Error(
        `Could not resolve a project id for ecosystem ${key}. Set FIREBASE_PROJECT_ID__${scope}, use a scoped service-account credential, or pass --project.`
      )
    }

    const nextApp = initializeApp(
      {
        credential: auth.credential,
        projectId: auth.projectId,
      },
      `inspect-${key}`
    )
    appCache.set(key, nextApp)
    return nextApp
  }

  async function dbFor(ecosystem, databaseId) {
    const normalizedDatabaseId = String(databaseId || '').trim()
    const key = `${ecosystem}:${normalizedDatabaseId || '(default)'}`
    if (dbCache.has(key)) return dbCache.get(key)

    const app = await adminAppForEcosystem(ecosystem)
    const db = normalizedDatabaseId
      ? getFirestore(app, normalizedDatabaseId)
      : getFirestore(app)
    dbCache.set(key, db)
    return db
  }

  const apps = []

  for (const entry of entries) {
    const identityDatabaseId = String(entry.ecosystem || '').trim()
    const appDatabaseId = String(entry.databaseId || identityDatabaseId).trim()
    const appDb = await dbFor(entry.ecosystem, appDatabaseId)
    const identityDb = await dbFor(entry.ecosystem, identityDatabaseId)

    const appRef = appDb.collection('apps').doc(entry.appId)
    const appSnap = await appRef.get()
    const appUsersSnap = appSnap.exists
      ? await appRef.collection('users').limit(options.limit).get()
      : null

    const memberships = []
    const missingIdentity = []
    const reviewIdentity = []
    let appLocalIdentityCount = 0

    if (appUsersSnap) {
      for (const membership of appUsersSnap.docs) {
        const uid = membership.id.trim()
        if (!uid) continue

        const identitySnap = await identityDb.collection('users').doc(uid).get()
        const appLocalIdentitySnap =
          appDatabaseId !== identityDatabaseId
            ? await appDb.collection('users').doc(uid).get()
            : null

        if (appLocalIdentitySnap?.exists) appLocalIdentityCount += 1

        const identity = identitySnap.exists ? identitySnap.data() || {} : null
        const summary = {
          uid,
          role: String(membership.get('role') || ''),
          identityExists: Boolean(identity),
          displayName: identity ? String(identity.display_name || '').trim() : '',
          handle: identity ? String(identity.handle || '').trim() : '',
          avatarSet: Boolean(String(identity?.avatar || '').trim()),
          appLocalIdentityExists: Boolean(appLocalIdentitySnap?.exists),
        }

        memberships.push(summary)

        if (!identity) {
          missingIdentity.push(uid)
        } else if (identityNeedsReview(summary, uid)) {
          reviewIdentity.push(uid)
        }
      }
    }

    let orphanAppLocalUsers = []
    if (appDatabaseId !== identityDatabaseId) {
      const localUsersSnap = await appDb.collection('users').limit(options.limit).get()
      orphanAppLocalUsers = localUsersSnap.docs.map((doc) => doc.id)
    }

    apps.push({
      key: entry.key,
      name: entry.name,
      role: entry.role,
      ecosystem: entry.ecosystem,
      appId: entry.appId,
      appDatabaseId,
      identityDatabaseId,
      appDocExists: appSnap.exists,
      membershipCount: memberships.length,
      appLocalIdentityCount,
      orphanAppLocalUsers,
      missingIdentity,
      reviewIdentity,
      memberships,
    })
  }

  return {
    ok: true,
    scannedRoles: [...selectedRoles],
    limit: options.limit,
    apps,
  }
}

function identityNeedsReview(summary, uid) {
  if (!summary.displayName) return true
  if (!summary.handle) return true
  if (!summary.avatarSet) return true

  const handle = String(summary.handle || '').toLowerCase()
  const uidPrefix = String(uid || '').toLowerCase().slice(0, 8)
  if (uidPrefix && handle.includes(uidPrefix)) return true

  const handleTokens = handle.split(/[-_]+/g).filter(Boolean)
  const lastToken = handleTokens.at(-1) || ''
  return handleTokens.length > 1 && /^[a-z0-9]{7,}$/.test(lastToken)
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/inspect-app-users.mjs --app <appId> [--ecosystem <id>] [--service-account <path>] [--project <projectId>] [--database <databaseId>] [--limit 10]',
      '  node scripts/inspect-app-users.mjs --identity-scan [--ecosystem <id>] [--roles tenant,standalone] [--limit 10]',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}
