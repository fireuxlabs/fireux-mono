#!/usr/bin/env node
/*
  Backfill missing per-app membership docs from core users.userOf/adminOf.

  Goal:
    For every user where users/{uid}.userOf contains <appId>, ensure:
      apps/{appId}/users/{uid} exists.

  Role rule:
    - If users/{uid}.adminOf contains <appId> => role: 'admin'
    - Else => role: 'user'

  Writes (only when missing):
    apps/{appId}/users/{uid} = {
      id: uid,
      role,
      creator_id: uid,
      created_at: serverTimestamp,
      updated_at: serverTimestamp,
    }

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path)
    - Or Google ADC (gcloud): application-default login

  Usage:
    node scripts/backfill-app-users-from-userOf.mjs --app <appId> [--dry-run]

  Options:
    --app <appId>   Target app id (required)
    --dry-run       Print intended creates; do not write
    --help, -h      Print help
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

const argv = process.argv.slice(2)
const args = new Set(argv)

function getArgValue(flag) {
  const idx = argv.indexOf(flag)
  if (idx === -1) return undefined
  const next = argv[idx + 1]
  if (!next || next.startsWith('--')) return undefined
  return next
}

function usage(exitCode = 0) {
  console.log('\nBackfill apps/{appId}/users/{uid} from users.userOf')
  console.log('\nUsage:')
  console.log(
    '  node scripts/backfill-app-users-from-userOf.mjs --app <appId> [--dry-run]'
  )
  console.log('\nOptions:')
  console.log('  --app <appId>   Target app id (required)')
  console.log('  --dry-run       Print intended creates; do not write')
  console.log('  --help, -h      Print help')
  console.log('')
  process.exit(exitCode)
}

if (args.has('--help') || args.has('-h')) usage(0)

const appId = (getArgValue('--app') ?? '').trim()
const dryRun = args.has('--dry-run')

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

async function main() {
  if (!appId) throw new Error('Missing --app <appId>')

  const {
    applicationDefault,
    cert,
    getApps,
    initializeApp,
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
  console.log(`- App: ${appId}`)
  if (dryRun) console.log('- Mode: dry-run')

  const usersSnap = await db
    .collection('users')
    .where('userOf', 'array-contains', appId)
    .get()

  const candidates = usersSnap.docs.map((d) => ({ uid: d.id, data: d.data() }))
  console.log(`- Core users with userOf.includes(app): ${candidates.length}`)

  const toCreate = []
  for (const entry of candidates) {
    const uid = entry.uid
    const data = entry.data ?? {}

    const memberRef = db.collection('apps').doc(appId).collection('users').doc(uid)
    const memberSnap = await memberRef.get()
    if (memberSnap.exists) continue

    const adminOf = Array.isArray(data.adminOf) ? data.adminOf : []
    const role = adminOf.some((id) => String(id) === appId) ? 'admin' : 'user'

    toCreate.push({ uid, role })

    if (!dryRun) {
      await memberRef.set({
        id: uid,
        role,
        creator_id: uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      })
    }
  }

  console.log(`✅ Missing membership docs created: ${toCreate.length}`)
  if (dryRun && toCreate.length) {
    console.log('Planned creates:')
    for (const entry of toCreate) console.log(`- ${entry.uid} (${entry.role})`)
  }
}

main().catch((error) => {
  console.error('❌ Backfill failed')
  console.error(error)
  process.exit(1)
})
