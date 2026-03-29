#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const args = parseArgs(process.argv.slice(2))

const serviceAccountPath = String(args['service-account'] || '').trim()
const appId = String(args.app || '').trim()
const explicitUid = String(args.uid || '').trim()
const email = String(args.email || '').trim().toLowerCase()
const displayName = String(args['display-name'] || '').trim()
const premiumArg = String(args.premium || 'true').trim().toLowerCase()
const explicitProjectId = String(args.project || '').trim()
const explicitDatabaseId = String(args.database || '').trim()

if (!serviceAccountPath || !appId || (!explicitUid && !email && !displayName)) {
  console.error(
    'Usage: node scripts/set-app-user-premium.mjs --service-account <path> --app <appId> (--uid <uid> | --email <email> | --display-name <name>) [--premium true|false] [--project <projectId>] [--database <databaseId>]'
  )
  process.exit(1)
}

const isPremium = premiumArg === 'true'
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

const auth = getAuth(adminApp)
const db = explicitDatabaseId
  ? getFirestore(adminApp, explicitDatabaseId)
  : getFirestore(adminApp)

let uid = explicitUid

if (!uid && email) {
  try {
    const authUser = await auth.getUserByEmail(email)
    uid = String(authUser.uid || '').trim()
  } catch (error) {
    console.warn('[set-app-user-premium] auth lookup failed, falling back to users collection', {
      email,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

if (!uid && email) {
  const userSnap = await db
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get()

  uid = String(userSnap.docs[0]?.id || '').trim()
}

if (!uid && displayName) {
  const userSnap = await db
    .collection('users')
    .where('display_name', '==', displayName)
    .limit(1)
    .get()

  uid = String(userSnap.docs[0]?.id || '').trim()
}

if (!uid) {
  console.error(`No user found for ${explicitUid || email || displayName}.`)
  process.exit(1)
}

const appUserRef = db.collection('apps').doc(appId).collection('users').doc(uid)
const appUserSnap = await appUserRef.get()

if (appUserSnap.exists) {
  await appUserRef.set(
    {
      is_premium: isPremium,
      updated: {
        at: FieldValue.serverTimestamp(),
        by: uid,
      },
    },
    { merge: true }
  )
} else {
  await appUserRef.set({
    id: uid,
    role: 'user',
    is_premium: isPremium,
    console_enabled: false,
    console_scopes: [],
    notifications: [],
    created: {
      at: FieldValue.serverTimestamp(),
      by: uid,
      app_id: appId,
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: uid,
    },
  })
}

const finalSnap = await appUserRef.get()

console.log(
  JSON.stringify(
    {
      ok: true,
      projectId,
      databaseId: explicitDatabaseId || '(default)',
      appId,
      requestedUid: explicitUid,
      email,
      displayName,
      uid,
      is_premium: finalSnap.get('is_premium') === true,
      path: appUserRef.path,
    },
    null,
    2
  )
)
