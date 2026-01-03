#!/usr/bin/env node
/*
  Firestore reconciliation: ensure app admin + sync mirrors.

  Goals
  - Ensure a target user (e.g. Daniel Watson) is an admin for each app.
  - Keep these three sources in sync:
      1) apps/{appId}/users/{uid}.role           (canonical)
      2) apps/{appId}.admin_ids[]               (mirror)
      3) users/{uid}.adminOf[]                  (mirror)
    And ensure users/{uid}.userOf[] includes appId when the overlay exists.

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path)
    - Or Google ADC (gcloud): application-default login

  Usage:
    node scripts/sync-app-admins.mjs --uid <uid> --app <appId> [--app <appId> ...] [--dry-run]
    node scripts/sync-app-admins.mjs --email <email> --all-known [--dry-run]
    node scripts/sync-app-admins.mjs --display-name "Daniel Watson" --all-known [--dry-run]

  Options:
    --app <id>           Repeatable; target app id(s)
    --all-known          Uses the repo’s six known apps
    --uid <uid>          Target user UID (preferred)
    --email <email>      Resolve target UID via users.email == email
    --display-name <nm>  Resolve target UID via users.display_name == nm
    --exclusive          Make the target user the ONLY admin for each app
    --reconcile-only     Reconcile overlays -> mirrors only (no target user)
    --dry-run            Print intended actions; do not write
    --limit <n>          Limit overlay users processed per app (debug)
    --help, -h           Print help
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

function getRepeatableArg(flag) {
  const values = []
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === flag) {
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) values.push(next)
    }
  }
  return values
}

function usage(exitCode = 0) {
  console.log('\nSync app admins + mirrors')
  console.log('\nUsage:')
  console.log('  node scripts/sync-app-admins.mjs --uid <uid> --app <appId> [--app <appId> ...] [--dry-run]')
  console.log('  node scripts/sync-app-admins.mjs --email <email> --all-known [--dry-run]')
  console.log('  node scripts/sync-app-admins.mjs --display-name "Daniel Watson" --all-known [--dry-run]')
  console.log('\nOptions:')
  console.log('  --app <id>           Repeatable; target app id(s)')
  console.log('  --all-known          Uses the repo’s six known apps')
  console.log('  --uid <uid>          Target user UID (preferred)')
  console.log('  --email <email>      Resolve target UID via users.email')
  console.log('  --display-name <nm>  Resolve target UID via users.display_name')
  console.log('  --exclusive          Make the target user the ONLY admin per app')
  console.log('  --reconcile-only     Reconcile overlays -> mirrors only (no target user)')
  console.log('  --dry-run            Print actions; do not write')
  console.log('  --limit <n>          Limit overlay users processed per app (debug)')
  console.log('  --help, -h           Print help')
  console.log('')
  process.exit(exitCode)
}

if (args.has('--help') || args.has('-h')) usage(0)

const dryRun = args.has('--dry-run')
const exclusive = args.has('--exclusive')
const reconcileOnly = args.has('--reconcile-only')

const knownApps = ['fireux-app', 'tennant', 'cleanbox-app', 'richies-reinigung', 'misebox-app', 'niederhorn']

const apps = (() => {
  const explicit = getRepeatableArg('--app')
  if (explicit.length) return explicit
  if (args.has('--all-known')) return knownApps
  return []
})()

const limitRaw = getArgValue('--limit')
const limit = limitRaw ? Math.max(0, Number(limitRaw) || 0) : 0

async function loadServiceAccount() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (inline) return JSON.parse(inline)

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsPath) return null

  const absolutePath = isAbsolute(credentialsPath)
    ? credentialsPath
    : resolve(process.cwd(), credentialsPath)
  const raw = await fs.readFile(absolutePath, 'utf-8')
  return JSON.parse(raw)
}

async function getDb() {
  const { applicationDefault, cert, getApps, initializeApp, getFirestore } =
    await loadFirebaseAdmin()

  if (getApps().length === 0) {
    const serviceAccount = await loadServiceAccount()
    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      initializeApp({ credential: applicationDefault() })
    }
  }

  return getFirestore()
}

async function resolveTargetUid(db) {
  if (reconcileOnly) return null

  const uid = getArgValue('--uid')
  if (uid) return uid

  const email = getArgValue('--email')
  const displayName = getArgValue('--display-name')

  if (!email && !displayName) {
    throw new Error('Provide --uid, --email, or --display-name')
  }

  let query = db.collection('users')
  if (email) query = query.where('email', '==', email)
  if (displayName) query = query.where('display_name', '==', displayName)

  const snap = await query.limit(5).get()
  if (snap.empty) {
    throw new Error('No matching user found in /users')
  }
  if (snap.size !== 1) {
    const ids = snap.docs.map((d) => d.id)
    throw new Error(
      `Ambiguous user match (count=${snap.size}). Provide --uid. Matches: ${ids.join(', ')}`
    )
  }

  return snap.docs[0].id
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function sanitizeStringList(list) {
  if (!Array.isArray(list)) return []
  return Array.from(
    new Set(
      list
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean)
    )
  )
}

async function main() {
  if (!apps.length) {
    usage(2)
  }

  const { FieldValue } = await loadFirebaseAdmin()
  const db = await getDb()

  const targetUid = await resolveTargetUid(db)
  if (!reconcileOnly) {
    console.log(`Target UID: ${targetUid}`)
  }
  console.log(`Mode: ${dryRun ? 'dry-run (no writes)' : 'apply'}`)
  if (!reconcileOnly) {
    console.log(
      `Exclusive: ${exclusive ? 'yes (ONLY admin)' : 'no (ensure admin)'}`
    )
  }
  console.log(`Apps: ${apps.join(', ')}`)

  for (const appId of apps) {
    console.log(`\n--- App: ${appId}`)

    const appRef = db.collection('apps').doc(appId)
    const appSnap = await appRef.get()
    if (!appSnap.exists) {
      console.log(`Skipping: apps/${appId} does not exist`)
      continue
    }

    const appData = appSnap.data() || {}
    const existingAdminIds = Array.isArray(appData.admin_ids)
      ? appData.admin_ids
      : []

    // Reconcile all overlay users in this app.
    // Canon: overlay role; Mirrors: apps/<appId>.admin_ids + users/<uid>.adminOf.
    const overlaySnap = await appRef.collection('users').get()
    const overlayDocs = overlaySnap.docs

    const ops = []

    const desiredByUid = new Map()

    for (const d of overlayDocs) {
      const uid = String(d.id ?? '').trim()
      if (!uid) continue
      const data = d.data() || {}
      const currentRole = data.role
      const normalizedRole = currentRole === 'admin' ? 'admin' : 'user'

      let desiredRole = normalizedRole
      if (!reconcileOnly && targetUid && uid === targetUid) {
        desiredRole = 'admin'
      }
      if (!reconcileOnly && exclusive && targetUid && uid !== targetUid) {
        desiredRole = 'user'
      }

      desiredByUid.set(uid, { currentRole, desiredRole })
    }

    // Ensure the target user exists as an overlay member (admin) when not reconcile-only.
    if (!reconcileOnly && targetUid && !desiredByUid.has(targetUid)) {
      desiredByUid.set(targetUid, { currentRole: undefined, desiredRole: 'admin' })
    }

    const desiredAdminIds = Array.from(desiredByUid.entries())
      .filter(([, v]) => v.desiredRole === 'admin')
      .map(([uid]) => uid)

    const existingSanitized = sanitizeStringList(existingAdminIds)
    const desiredSanitized = sanitizeStringList(desiredAdminIds)
    const sameAdminIds =
      existingSanitized.length === desiredSanitized.length &&
      existingSanitized.every((id) => desiredSanitized.includes(id))

    if (!sameAdminIds) {
      console.log(`Update apps/${appId}.admin_ids => [${desiredSanitized.join(', ')}]`)
      if (!dryRun) {
        await appRef.set({ admin_ids: desiredSanitized }, { merge: true })
      }
    }

    // Fetch core user docs for all overlay members we are reconciling so we can
    // report *real* drift (and avoid writing when already correct).
    const uids = Array.from(desiredByUid.keys())
    const userDocRefs = uids.map((uid) => db.collection('users').doc(uid))
    const userSnapChunks = chunk(userDocRefs, 200)
    const userDataByUid = new Map()

    for (const refs of userSnapChunks) {
      const snaps = await db.getAll(...refs)
      for (const s of snaps) {
        userDataByUid.set(s.id, s.exists ? s.data() || {} : null)
      }
    }

    for (const [uid, v] of desiredByUid.entries()) {
      if (limit && ops.length >= limit) break

      const desiredRole = v.desiredRole
      const currentRole = v.currentRole

      if (currentRole !== desiredRole) {
        ops.push({ kind: 'overlay-role', uid, desiredRole })
      }

      const userData = userDataByUid.get(uid) ?? null
      const userOf = sanitizeStringList(userData?.userOf)
      const adminOf = sanitizeStringList(userData?.adminOf)

      // Ensure userOf contains appId for any overlay member.
      if (!userOf.includes(appId)) {
        ops.push({ kind: 'userof', uid })
      }

      // Ensure adminOf matches desiredRole.
      const hasAdmin = adminOf.includes(appId)
      const shouldHaveAdmin = desiredRole === 'admin'
      if (shouldHaveAdmin !== hasAdmin) {
        ops.push({ kind: 'adminof', uid, desiredRole })
      }
    }

    console.log(
      `Reconciling ${desiredByUid.size} overlay members (ops=${ops.length})`
    )

    const batches = chunk(ops, 400)
    for (let i = 0; i < batches.length; i += 1) {
      const batchOps = batches[i]
      if (dryRun) continue

      const batch = db.batch()
      for (const op of batchOps) {
        if (op.kind === 'overlay-role') {
          const ref = appRef.collection('users').doc(op.uid)
          batch.set(
            ref,
            {
              id: op.uid,
              role: op.desiredRole,
              updated_at: FieldValue.serverTimestamp(),
            },
            { merge: true }
          )
        }
        if (op.kind === 'userof') {
          const ref = db.collection('users').doc(op.uid)
          batch.set(ref, { userOf: FieldValue.arrayUnion(appId) }, { merge: true })
        }
        if (op.kind === 'adminof') {
          const ref = db.collection('users').doc(op.uid)
          batch.set(
            ref,
            {
              adminOf:
                op.desiredRole === 'admin'
                  ? FieldValue.arrayUnion(appId)
                  : FieldValue.arrayRemove(appId),
            },
            { merge: true }
          )
        }
      }
      await batch.commit()
    }

    console.log('✅ Done app sync')
  }

  console.log('\n✅ All done')
}

main().catch((err) => {
  console.error('\n❌ sync failed')
  console.error(err)
  process.exitCode = 1
})
