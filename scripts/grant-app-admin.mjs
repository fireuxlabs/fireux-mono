#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'

const serviceAccountPath = String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT).trim()
const appId = String(args.app || '').trim()
const explicitUid = String(args.uid || '').trim()
const email = String(args.email || '').trim().toLowerCase()
const displayNameArg = String(args['display-name'] || '').trim()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()
const commit = Boolean(args.commit)

if (!appId || (!explicitUid && !email && !displayNameArg)) {
  console.error(
    [
      'Usage:',
      '  node scripts/grant-app-admin.mjs --app <appId> (--uid <uid> | --email <email> | --display-name <name>) --database <databaseId> [--commit]',
      '',
      'Examples:',
      '  node scripts/grant-app-admin.mjs --app sproochli --database sproochli --email d.m.watson1985@gmail.com --commit',
      '  node scripts/grant-app-admin.mjs --app fireux-app --database fireux --email d.m.watson1985@gmail.com --commit',
    ].join('\n')
  )
  process.exit(1)
}

const rawServiceAccount = await readFile(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawServiceAccount)
const projectId = explicitProjectId || String(serviceAccount.project_id || '').trim()

if (!projectId) {
  console.error('Could not resolve project id from --project or service account.')
  process.exit(1)
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId,
})

const auth = getAuth(adminApp)
const db = explicitDatabaseId
  ? getFirestore(adminApp, explicitDatabaseId)
  : getFirestore(adminApp)

let uid = explicitUid
let authUser = null

if (!uid && email) {
  try {
    authUser = await auth.getUserByEmail(email)
    uid = String(authUser.uid || '').trim()
  } catch (error) {
    console.warn('[grant-app-admin] auth lookup failed, falling back to users collection', {
      email,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

if (!uid && email) {
  const userSnap = await db.collection('users').where('email', '==', email).limit(1).get()
  uid = String(userSnap.docs[0]?.id || '').trim()
}

if (!uid && displayNameArg) {
  const userSnap = await db
    .collection('users')
    .where('display_name', '==', displayNameArg)
    .limit(1)
    .get()

  uid = String(userSnap.docs[0]?.id || '').trim()
}

if (!uid) {
  console.error(`No user found for ${explicitUid || email || displayNameArg}.`)
  process.exit(1)
}

if (!authUser) {
  try {
    authUser = await auth.getUser(uid)
  } catch {
    authUser = null
  }
}

const appRef = db.collection('apps').doc(appId)
const userRef = db.collection('users').doc(uid)
const appUserRef = appRef.collection('users').doc(uid)

const [appSnap, userSnap, appUserSnap] = await Promise.all([
  appRef.get(),
  userRef.get(),
  appUserRef.get(),
])

if (!appSnap.exists) {
  console.error(`Missing app document: apps/${appId} in database ${explicitDatabaseId || '(default)'}`)
  process.exit(1)
}

const authDisplayName = String(authUser?.displayName || '').trim()
const authEmail = String(authUser?.email || email || '').trim().toLowerCase()
const displayName = displayNameArg || authDisplayName || authEmail.split('@')[0] || uid
const createdAppUser = !appUserSnap.exists
const existingAppUser = appUserSnap.exists ? appUserSnap.data() || {} : {}

const corePatch = userSnap.exists
  ? {
      userOf: FieldValue.arrayUnion(appId),
      adminOf: FieldValue.arrayUnion(appId),
      updated: {
        at: FieldValue.serverTimestamp(),
        by: 'scripts/grant-app-admin',
      },
    }
  : {
      display_name: displayName,
      avatar: String(authUser?.photoURL || ''),
      handle: makeHandle(displayName, uid),
      email: authEmail,
      bio: '',
      profiles: [],
      projects: [],
      userOf: [appId],
      adminOf: [appId],
      notifications: [],
      created: {
        at: FieldValue.serverTimestamp(),
        by: 'scripts/grant-app-admin',
      },
      updated: {
        at: FieldValue.serverTimestamp(),
        by: 'scripts/grant-app-admin',
      },
    }

const appUserPatch = {
  id: uid,
  role: 'admin',
  is_premium:
    typeof existingAppUser.is_premium === 'boolean' ? existingAppUser.is_premium : false,
  console_enabled: true,
  console_scopes: Array.isArray(existingAppUser.console_scopes)
    ? existingAppUser.console_scopes
    : [],
  notifications: Array.isArray(existingAppUser.notifications) ? existingAppUser.notifications : [],
  ...(appUserSnap.exists
    ? {}
    : {
        created: {
          at: FieldValue.serverTimestamp(),
          by: 'scripts/grant-app-admin',
          app_id: appId,
        },
      }),
  updated: {
    at: FieldValue.serverTimestamp(),
    by: 'scripts/grant-app-admin',
  },
}

const appPatch = {
  admin_ids: FieldValue.arrayUnion(uid),
  ...(createdAppUser ? { 'derived.user_count': FieldValue.increment(1) } : {}),
  updated: {
    at: FieldValue.serverTimestamp(),
    by: 'scripts/grant-app-admin',
  },
}

const summary = {
  ok: true,
  mode: commit ? 'commit' : 'dry-run',
  projectId,
  databaseId: explicitDatabaseId || '(default)',
  appId,
  uid,
  email: authEmail,
  displayName,
  paths: {
    app: appRef.path,
    user: userRef.path,
    appUser: appUserRef.path,
  },
  changes: {
    coreUser: userSnap.exists ? 'merge userOf/adminOf' : 'create',
    appUser: appUserSnap.exists ? 'set role admin' : 'create admin',
    app: 'arrayUnion admin_ids',
  },
}

if (!commit) {
  console.log(JSON.stringify(summary, null, 2))
  process.exit(0)
}

const batch = db.batch()
batch.set(userRef, corePatch, { merge: true })
batch.set(appUserRef, appUserPatch, { merge: true })
batch.set(appRef, appPatch, { merge: true })
await batch.commit()

const [finalUserSnap, finalAppSnap, finalAppUserSnap] = await Promise.all([
  userRef.get(),
  appRef.get(),
  appUserRef.get(),
])

console.log(
  JSON.stringify(
    {
      ...summary,
      verified: {
        coreAdminOf: finalUserSnap.get('adminOf') || [],
        appAdminIds: finalAppSnap.get('admin_ids') || [],
        appUserRole: finalAppUserSnap.get('role') || '',
        consoleEnabled: finalAppUserSnap.get('console_enabled') === true,
      },
    },
    null,
    2
  )
)

function makeHandle(displayName, uid) {
  const base = String(displayName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = String(uid || '').slice(0, 8)
  return `${base || 'user'}-${suffix}`
}
