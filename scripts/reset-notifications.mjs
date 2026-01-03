#!/usr/bin/env node
/*
  Hard reset: delete notification data everywhere.

  Deletes the `notifications` field entirely from:
    - users/{uid}
    - apps/{appId}/users/{uid}

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path)
    - Or Google ADC (gcloud): application-default login

  Usage:
    node scripts/reset-notifications.mjs
*/

import { createRequire } from 'node:module'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

const requireFromCwd = createRequire(resolve(process.cwd(), 'package.json'))

async function loadFirebaseAdmin() {
  const adminApp = await import(requireFromCwd.resolve('firebase-admin/app'))
  const adminFirestore = await import(
    requireFromCwd.resolve('firebase-admin/firestore')
  )

  return {
    applicationDefault: adminApp.applicationDefault,
    cert: adminApp.cert,
    getApps: adminApp.getApps,
    initializeApp: adminApp.initializeApp,
    FieldPath: adminFirestore.FieldPath,
    FieldValue: adminFirestore.FieldValue,
    getFirestore: adminFirestore.getFirestore,
  }
}

async function loadServiceAccount() {
  const fromEnvJson = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  if (fromEnvJson) {
    try {
      return JSON.parse(fromEnvJson)
    } catch (error) {
      throw new Error(
        `Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${error?.message ?? String(error)}`
      )
    }
  }

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  if (gac) {
    const path = isAbsolute(gac) ? gac : resolve(process.cwd(), gac)
    try {
      const raw = await fs.readFile(path, 'utf8')
      return JSON.parse(raw)
    } catch (error) {
      throw new Error(
        `Unable to read GOOGLE_APPLICATION_CREDENTIALS at "${path}": ${error?.message ?? String(error)}`
      )
    }
  }

  return null
}

async function listAllDocIdsOrdered(db, FieldPath, collectionPath, pageSize = 500) {
  const ids = []
  let lastDoc = null

  for (;;) {
    let query = db
      .collection(collectionPath)
      .orderBy(FieldPath.documentId())
      .limit(pageSize)

    if (lastDoc) query = query.startAfter(lastDoc)

    const snap = await query.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      ids.push(docSnap.id)
      lastDoc = docSnap
    }
  }

  return ids
}

async function listApps(db, FieldPath) {
  const snap = await db.collection('apps').orderBy(FieldPath.documentId()).get()
  return snap.docs.map((d) => d.id)
}

async function commitBatches(db, ops) {
  let committed = 0
  for (let i = 0; i < ops.length; i += 450) {
    const slice = ops.slice(i, i + 450)
    const batch = db.batch()
    for (const op of slice) batch.update(op.ref, op.data)
    await batch.commit()
    committed += slice.length
  }
  return committed
}

async function main() {
  const {
    applicationDefault,
    cert,
    getApps,
    initializeApp,
    FieldPath,
    FieldValue,
    getFirestore,
  } = await loadFirebaseAdmin()

  const existingApps = getApps()
  const hasApp = Array.isArray(existingApps) && existingApps.length > 0

  const serviceAccount = await loadServiceAccount()

  if (!hasApp) {
    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    })
  }

  const db = getFirestore()

  const project = serviceAccount?.project_id ?? null
  if (project) console.log(`- Project: ${project}`)

  const userIds = await listAllDocIdsOrdered(db, FieldPath, 'users')
  console.log(`- Users: ${userIds.length}`)

  const apps = await listApps(db, FieldPath)
  console.log(`- Apps: ${apps.length}`)

  // 1) Remove notifications from users/{uid}
  const userOps = userIds.map((uid) => ({
    ref: db.collection('users').doc(uid),
    data: { notifications: FieldValue.delete() },
  }))

  const usersCommitted = await commitBatches(db, userOps)
  console.log(`✅ Cleared users.notifications (writes): ${usersCommitted}`)

  // 2) Remove notifications from apps/{appId}/users/{uid}
  let appMembershipDocs = 0
  let appMembershipWrites = 0

  for (const appId of apps) {
    const subPath = `apps/${appId}/users`
    const memberIds = await listAllDocIdsOrdered(db, FieldPath, subPath)
    appMembershipDocs += memberIds.length

    if (!memberIds.length) continue

    const ops = memberIds.map((uid) => ({
      ref: db.collection('apps').doc(appId).collection('users').doc(uid),
      data: { notifications: FieldValue.delete() },
    }))

    appMembershipWrites += await commitBatches(db, ops)
  }

  console.log(`- App membership docs: ${appMembershipDocs}`)
  console.log(`✅ Cleared apps/*/users/*.notifications (writes): ${appMembershipWrites}`)
  console.log('✅ Notification reset complete')
}

main().catch((error) => {
  console.error('❌ Reset failed')
  console.error(error)
  process.exit(1)
})
