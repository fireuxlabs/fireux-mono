#!/usr/bin/env node
/*
  Firestore migration (Misebox): mirror ALL core users into the app user overlay.

  Goal:
    - Keep core users in /users (unchanged)
    - Ensure every /users/{uid} also has an app-scoped overlay:
        /apps/<appId>/users/{uid}
      so Misebox can assign roles, list members, etc.
    - Ensure core users include the app in userOf[]
    - Set apps/<appId>.user_count to the resulting overlay size

  Usage (run from repo root):
    pnpm --filter ./projects/misebox/misebox-app exec node scripts/migrate-misebox-app-users.mjs [--app misebox-app] [--dry-run]

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string) OR
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON) OR
    - Google ADC (gcloud): gcloud auth application-default login

  Flags:
    --app <id>     Target app id (default: misebox-app)
    --dry-run      Print actions; do not write
    --limit <n>    Limit number of core users processed (debug)
    --help, -h     Show help
*/

import { createRequire } from 'node:module'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

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

const args = new Set(process.argv.slice(2))
const help = args.has('--help') || args.has('-h')
const dryRun = args.has('--dry-run')

function getArgValue(flag) {
  const list = process.argv.slice(2)
  const idx = list.indexOf(flag)
  if (idx === -1) return undefined
  const next = list[idx + 1]
  if (!next || next.startsWith('--')) return undefined
  return next
}

function printHelp() {
  console.log('\nFirestore migration: mirror /users -> /apps/<appId>/users\n')
  console.log('Usage:')
  console.log(
    '  pnpm --filter ./projects/misebox/misebox-app exec node scripts/migrate-misebox-app-users.mjs [--app misebox-app] [--dry-run]'
  )
  console.log('\nAuth (one required):')
  console.log('  - FIREBASE_SERVICE_ACCOUNT            (JSON string)')
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS      (path to JSON)')
  console.log('  - OR Google ADC (gcloud): application-default login')
  console.log('\nFlags:')
  console.log('  --app <id>     Target app id (default: misebox-app)')
  console.log('  --dry-run      Print actions; do not write')
  console.log('  --limit <n>    Limit number of core users processed (debug)')
  console.log('  --help, -h     Show this help')
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
  const { applicationDefault, cert, getApps, initializeApp, getFirestore } =
    await loadFirebaseAdmin()

  if (getApps().length === 0) {
    const hasExplicitCreds = Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS
    )

    if (hasExplicitCreds) {
      const serviceAccount = await loadServiceAccount()
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      initializeApp({ credential: applicationDefault() })
    }
  }
  return getFirestore()
}

function asPositiveInt(value) {
  if (!value) return undefined
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return Math.floor(n)
}

async function main() {
  if (help) {
    printHelp()
    return
  }

  const appId = getArgValue('--app') || 'misebox-app'
  const limit = asPositiveInt(getArgValue('--limit'))

  const { FieldPath, FieldValue } = await loadFirebaseAdmin()

  const db = await getDb()

  const appRef = db.collection('apps').doc(appId)
  const appSnap = await appRef.get()
  if (!appSnap.exists) {
    throw new Error(`Missing app document: apps/${appId}`)
  }

  console.log(`Target app: ${appId}`)
  console.log(`Mode: ${dryRun ? 'dry-run (no writes)' : 'apply'}`)

  // Fetch current overlay members once to avoid per-user reads.
  const existingOverlay = await appRef.collection('users').get()
  const overlayIds = new Set(existingOverlay.docs.map((d) => d.id))

  const backfillNotification = () => ({
    app_id: appId,
    read: false,
    created_at: new Date().toISOString(),
    id: randomUUID(),
    scope: 'app',
    message: `Membership backfilled as user for ${appId}`,
  })

  // Stream core users in pages.
  const coreUserIds = []
  let last = null
  let processed = 0
  let createdOverlay = 0
  let updatedUserOf = 0

  const commitBatch = async (batch, ops) => {
    if (ops === 0) return { batch, ops }
    if (!dryRun) await batch.commit()
    return { batch: db.batch(), ops: 0 }
  }

  let batch = db.batch()
  let ops = 0

  while (true) {
    let query = db.collection('users').orderBy(FieldPath.documentId()).limit(500)
    if (last) query = query.startAfter(last)

    const snap = await query.get()
    if (snap.empty) break

    for (const docSnap of snap.docs) {
      const uid = docSnap.id
      coreUserIds.push(uid)
      processed++
      if (limit && processed > limit) break

      const data = docSnap.data() || {}
      const userOf = Array.isArray(data.userOf) ? data.userOf : []
      const hasUserOf = userOf.includes(appId)

      if (!hasUserOf) {
        batch.update(docSnap.ref, { userOf: FieldValue.arrayUnion(appId) })
        ops++
        updatedUserOf++
      }

      if (!overlayIds.has(uid)) {
        const overlayRef = appRef.collection('users').doc(uid)
        batch.set(
          overlayRef,
          {
            id: uid,
            role: 'user',
            creator_id: uid,
            notifications: [backfillNotification()],
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
        ops++
        createdOverlay++
        overlayIds.add(uid)
      }

      if (ops >= 400) {
        ;({ batch, ops } = await commitBatch(batch, ops))
      }
    }

    if (limit && processed >= limit) break

    last = snap.docs[snap.docs.length - 1]
    if (snap.size < 500) break
  }

  ;({ batch, ops } = await commitBatch(batch, ops))

  // Recount overlays and set app.user_count to exact size.
  const finalOverlaySnap = await appRef.collection('users').get()
  const finalCount = finalOverlaySnap.size

  console.log('\nSummary:')
  console.log(`- Core users scanned: ${processed}`)
  console.log(`- userOf[] updated:   ${updatedUserOf}`)
  console.log(`- Overlay created:    ${createdOverlay}`)
  console.log(`- Overlay final size: ${finalCount}`)

  console.log(`\nSetting apps/${appId}.user_count = ${finalCount}`)
  if (!dryRun) {
    await appRef.set({ user_count: finalCount }, { merge: true })
  }

  console.log('\n✅ Done')
}

main().catch((err) => {
  console.error('\n❌ Migration failed')
  console.error(err)
  process.exitCode = 1
})
