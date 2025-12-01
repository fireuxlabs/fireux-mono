#!/usr/bin/env ts-node

/**
 * Remove a specific UID from app admin lists and membership overlays.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_FILE=path/to/service-account.json \
 *   pnpm tsx automation/migrations/2025-12-remove-app-admin.ts --uid <firebase-uid> [--app <id>] [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface AppDoc {
  id: string
  app_name?: string
  admin_ids?: string[]
}

interface RemovalResult {
  appId: string
  removedFromAdmins: boolean
  membershipDeleted: boolean
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const TARGET_UID =
  getSingle('--uid') ||
  process.env.FIREUX_TARGET_UID ||
  process.env.FIREBASE_TARGET_UID ||
  ''
const APP_FILTERS = collectMulti('--app')

if (!TARGET_UID.trim()) {
  console.error('❌ Missing required --uid flag (or FIREUX_TARGET_UID env).')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DEFAULT_SA_PATHS = [
  path.resolve(
    __dirname,
    '../../packages/core/fireux-core/config/service-account.json'
  ),
  path.resolve(
    __dirname,
    '../../projects/fireux/fireux-app/config/service-account.json'
  ),
]

function collectMulti(flag: string): string[] {
  const values: string[] = []
  args.forEach((arg, index) => {
    if (arg === flag && args[index + 1]) {
      values.push(args[index + 1])
    } else if (arg.startsWith(`${flag}=`)) {
      values.push(arg.split('=')[1])
    }
  })
  return values
}

function getSingle(flag: string): string | null {
  const index = args.findIndex(
    (entry) => entry === flag || entry.startsWith(`${flag}=`)
  )
  if (index === -1) return null
  const token = args[index]
  if (token.includes('=')) return token.split('=')[1]
  return args[index + 1] ?? null
}

function loadCredential() {
  try {
    const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (inlineJson) {
      console.log(
        '🔐 Using FIREBASE_SERVICE_ACCOUNT_JSON environment variable.'
      )
      return cert(JSON.parse(inlineJson))
    }
    if (filePath && fs.existsSync(filePath)) {
      console.log(`🔐 Using FIREBASE_SERVICE_ACCOUNT_FILE: ${filePath}`)
      return cert(JSON.parse(fs.readFileSync(filePath, 'utf8')))
    }
    const fallback = DEFAULT_SA_PATHS.find((p) => fs.existsSync(p))
    if (fallback) {
      console.log(`🔐 Using fallback service account path: ${fallback}`)
      return cert(JSON.parse(fs.readFileSync(fallback, 'utf8')))
    }
    console.log(
      '🛈 No service account supplied; falling back to Application Default Credentials.'
    )
    return applicationDefault()
  } catch (error) {
    console.error(
      'Failed to load Firebase credentials. Provide FIREBASE_SERVICE_ACCOUNT_JSON, set FIREBASE_SERVICE_ACCOUNT_FILE, or run `gcloud auth application-default login`.'
    )
    throw error
  }
}

initializeApp({ credential: loadCredential() })
const db = getFirestore()

function shouldProcess(appId: string): boolean {
  if (!APP_FILTERS.length) return true
  return APP_FILTERS.includes(appId)
}

async function removeAdminFromApp(
  docId: string
): Promise<RemovalResult | null> {
  if (!shouldProcess(docId)) return null

  const docRef = db.collection('apps').doc(docId)
  const snap = await docRef.get()
  if (!snap.exists) return null
  const data = snap.data() as AppDoc
  const adminIds = Array.isArray(data.admin_ids) ? data.admin_ids : []
  const isAdmin = adminIds.includes(TARGET_UID)

  if (!isAdmin) {
    return { appId: docId, removedFromAdmins: false, membershipDeleted: false }
  }

  console.log(`- ${docId}: removing ${TARGET_UID} from admin_ids`)

  if (!DRY_RUN) {
    await docRef.update({ admin_ids: FieldValue.arrayRemove(TARGET_UID) })
  }

  const membershipRef = docRef.collection('users').doc(TARGET_UID)
  let membershipDeleted = false
  if ((await membershipRef.get()).exists) {
    if (!DRY_RUN) {
      await membershipRef.delete()
    }
    membershipDeleted = true
  }

  if (!DRY_RUN) {
    await db
      .collection('users')
      .doc(TARGET_UID)
      .set(
        {
          updated_at: FieldValue.serverTimestamp(),
          adminOf: FieldValue.arrayRemove(docId),
          userOf: FieldValue.arrayRemove(docId),
        },
        { merge: true }
      )
  }

  return { appId: docId, removedFromAdmins: true, membershipDeleted }
}

async function main() {
  console.log('\n=== Remove App Admin ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`)
  console.log(`Target UID: ${TARGET_UID}`)
  if (APP_FILTERS.length) {
    console.log(`Filtering apps: ${APP_FILTERS.join(', ')}`)
  }

  const snapshot = await db.collection('apps').get()
  if (snapshot.empty) {
    console.log('No apps found; exiting.')
    return
  }

  const actions: RemovalResult[] = []

  for (const doc of snapshot.docs) {
    const result = await removeAdminFromApp(doc.id)
    if (result) actions.push(result)
  }

  const removed = actions.filter((item) => item.removedFromAdmins)
  console.log(`\nApps updated: ${removed.length}`)
  removed.forEach((item) => {
    console.log(
      `  • ${item.appId}: admin_ids updated${
        item.membershipDeleted ? ', membership deleted' : ''
      }`
    )
  })
}

main().catch((error) => {
  console.error('Removal script failed:', error)
  process.exit(1)
})
