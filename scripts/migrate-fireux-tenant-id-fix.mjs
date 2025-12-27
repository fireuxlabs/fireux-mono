#!/usr/bin/env node
/*
  One-time Firestore migration:
  - apps/fireux-tennant -> apps/fireux-tenant
  - apps/<id>/users subcollection copied
  - users/<uid>.adminOf + users/<uid>.userOf updated

  Usage (run from repo root):
    pnpm --filter ./projects/fireux/fireux-app exec node scripts/migrate-fireux-tenant-id-fix.mjs

  Auth:
    - FIREBASE_SERVICE_ACCOUNT (JSON string) OR
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

const OLD_APP_ID = 'fireux-tennant'
const NEW_APP_ID = 'fireux-tenant'

const args = new Set(process.argv.slice(2))
const help = args.has('--help') || args.has('-h')
const keepOld = args.has('--keep-old')
const force = args.has('--force')
const dryRun = args.has('--dry-run')

function printHelp() {
  // Keep this minimal and copy-pastable.
  console.log(`\nFirestore migration: ${OLD_APP_ID} -> ${NEW_APP_ID}\n`)
  console.log('Usage:')
  console.log(
    '  pnpm --filter ./projects/fireux/fireux-app exec node scripts/migrate-fireux-tenant-id-fix.mjs [--dry-run] [--force] [--keep-old]'
  )
  console.log('\nAuth (one required):')
  console.log('  - FIREBASE_SERVICE_ACCOUNT            (JSON string)')
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS      (path to JSON)')
  console.log('  - OR Google ADC (gcloud): application-default login')
  console.log('\nFlags:')
  console.log('  --dry-run     Print actions; do not write or delete')
  console.log('  --force       Overwrite apps/fireux-tenant if it exists')
  console.log('  --keep-old    Keep apps/fireux-tennant after copying')
  console.log('  --help, -h    Show this help')
  console.log('')
}

async function loadServiceAccount() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (inline) return JSON.parse(inline)

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsPath) {
    throw new Error(
      'Missing credentials: set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS'
    )
  }

  const absolutePath = isAbsolute(credentialsPath)
    ? credentialsPath
    : resolve(process.cwd(), credentialsPath)
  const raw = await fs.readFile(absolutePath, 'utf-8')
  return JSON.parse(raw)
}

async function getDb() {
  if (getApps().length === 0) {
    const hasExplicitCreds = Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS
    )

    if (hasExplicitCreds) {
      const serviceAccount = await loadServiceAccount()
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      // Falls back to Google Application Default Credentials (ADC), e.g.:
      //   gcloud auth application-default login
      initializeApp({ credential: applicationDefault() })
    }
  }
  return getFirestore()
}

function replaceAppIdInList(list, fromId, toId) {
  if (!Array.isArray(list)) return list
  const next = list
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .map((v) => (v === fromId ? toId : v))
  return Array.from(new Set(next))
}

async function main() {
  if (help) {
    printHelp()
    return
  }

  const db = await getDb()

  const oldRef = db.collection('apps').doc(OLD_APP_ID)
  const newRef = db.collection('apps').doc(NEW_APP_ID)

  const [oldSnap, newSnap] = await Promise.all([oldRef.get(), newRef.get()])
  if (!oldSnap.exists) {
    console.log(`Nothing to migrate: apps/${OLD_APP_ID} does not exist.`)
    return
  }
  const newExists = newSnap.exists

  const oldData = oldSnap.data() || {}
  const nextAppDoc = {
    ...oldData,
    id: NEW_APP_ID,
  }

  // Optional light copy fixes (safe): adjust names if they contain the misspelling.
  if (typeof nextAppDoc.app_name === 'string') {
    nextAppDoc.app_name = nextAppDoc.app_name.replace(/tennant/gi, 'tenant')
  }
  if (typeof nextAppDoc.app_short_name === 'string') {
    nextAppDoc.app_short_name = nextAppDoc.app_short_name.replace(/tennant/gi, 'tenant')
  }
  if (typeof nextAppDoc.slug === 'string') {
    nextAppDoc.slug = nextAppDoc.slug.replace(/tennant/gi, 'tenant')
  }

  console.log(`Copying app doc: apps/${OLD_APP_ID} -> apps/${NEW_APP_ID}`)
  if (newExists && !force) {
    console.log(`- apps/${NEW_APP_ID} already exists; leaving app doc as-is (use --force to overwrite)`)
  } else if (!dryRun) {
    await newRef.set(nextAppDoc, { merge: false })
  }

  console.log(`Copying subcollection: apps/${OLD_APP_ID}/users -> apps/${NEW_APP_ID}/users`)
  const oldUsers = await oldRef.collection('users').get()
  const userIds = []
  let batch = db.batch()
  let ops = 0
  const commitBatch = async () => {
    if (ops === 0) return
    if (!dryRun) await batch.commit()
    batch = db.batch()
    ops = 0
  }

  const mergeUserDocs = newExists && !force

  for (const docSnap of oldUsers.docs) {
    const uid = docSnap.id
    userIds.push(uid)
    const dest = newRef.collection('users').doc(uid)
    batch.set(dest, docSnap.data(), { merge: mergeUserDocs })
    ops++
    if (ops >= 400) await commitBatch()
  }
  await commitBatch()

  // Update core user mirrors for every member/admin found in the app users subcollection.
  console.log(`Updating users/<uid> mirrors for ${userIds.length} user(s)`)
  for (const uid of userIds) {
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    if (!userSnap.exists) continue
    const u = userSnap.data() || {}

    const nextAdminOf = replaceAppIdInList(u.adminOf, OLD_APP_ID, NEW_APP_ID)
    const nextUserOf = replaceAppIdInList(u.userOf, OLD_APP_ID, NEW_APP_ID)

    // Only update if needed to minimize writes.
    const adminChanged = JSON.stringify(nextAdminOf) !== JSON.stringify(u.adminOf || [])
    const userChanged = JSON.stringify(nextUserOf) !== JSON.stringify(u.userOf || [])
    if (!adminChanged && !userChanged) continue

    if (!dryRun) {
      await userRef.update({
        ...(adminChanged ? { adminOf: nextAdminOf } : {}),
        ...(userChanged ? { userOf: nextUserOf } : {}),
      })
    }
  }

  if (!keepOld) {
    console.log(`Deleting old data: apps/${OLD_APP_ID}`)
    // Delete subcollection docs first.
    const oldUsersAgain = await oldRef.collection('users').get()
    batch = db.batch()
    ops = 0
    for (const docSnap of oldUsersAgain.docs) {
      batch.delete(docSnap.ref)
      ops++
      if (ops >= 400) await commitBatch()
    }
    await commitBatch()

    if (!dryRun) {
      await oldRef.delete()
    }
  }

  console.log('✅ Migration complete')
  console.log(`- New app id: ${NEW_APP_ID}`)
  console.log(`- Old app id removed: ${!keepOld && !dryRun}`)
  if (dryRun) console.log('- Mode: dry-run (no writes performed)')
}

main().catch((err) => {
  console.error('❌ Migration failed')
  console.error(err)
  process.exitCode = 1
})
