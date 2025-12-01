#!/usr/bin/env ts-node

/**
 * Ensure a specific user is listed as an admin across every app document and has a
 * matching membership overlay in apps/{appId}/users/{uid}. Intended to run per
 * Firebase project (Cleanbox, Misebox, FireUX, etc.).
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_FILE=path/to/service-account.json \
 *   pnpm tsx automation/migrations/2025-12-ensure-global-admin.ts --uid <firebase-uid>
 *
 * Flags:
 *   --uid <uid>             Required. Target Firebase Auth UID to elevate.
 *   --dry-run               Preview updates without writing.
 *   --app <appId>           Repeatable. Limit to specific app ids.
 *   --globals-only          Only process apps where role === 'global'.
 *   --tenants-only          Only process apps where role === 'tenant'.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface AppDoc {
  id: string
  app_name?: string
  admin_ids?: string[]
  role?: string
  ecosystem?: string
}

interface MembershipResult {
  created: boolean
  previousRole: string | null
  nextRole: 'admin'
}

interface AppSummary {
  appId: string
  appName?: string
  adminIdsUpdated: boolean
  membership: MembershipResult
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const APP_FILTER = collectMultiValue('--app')
const INCLUDE_GLOBALS_ONLY = args.includes('--globals-only')
const INCLUDE_TENANTS_ONLY = args.includes('--tenants-only')
const TARGET_UID =
  getSingleValue('--uid') ||
  process.env.FIREUX_TARGET_UID ||
  process.env.FIREBASE_TARGET_UID ||
  ''

if (!TARGET_UID.trim()) {
  console.error('❌ Missing required --uid flag (or FIREUX_TARGET_UID env).')
  process.exit(1)
}

if (INCLUDE_GLOBALS_ONLY && INCLUDE_TENANTS_ONLY) {
  console.error('❌ Cannot combine --globals-only and --tenants-only flags.')
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

let credentialProjectId: string | null = null

function collectMultiValue(flag: string): string[] {
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

function getSingleValue(flag: string): string | null {
  const index = args.findIndex(
    (entry) => entry === flag || entry.startsWith(`${flag}=`)
  )
  if (index === -1) return null
  const token = args[index]
  if (token.includes('=')) {
    return token.split('=')[1]
  }
  return args[index + 1] ?? null
}

function rememberProjectId(payload: any) {
  if (
    payload &&
    typeof payload === 'object' &&
    payload.project_id &&
    !credentialProjectId
  ) {
    credentialProjectId = payload.project_id
  }
}

function loadCredential() {
  try {
    const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (inlineJson) {
      console.log(
        '🔐 Using FIREBASE_SERVICE_ACCOUNT_JSON environment variable.'
      )
      const parsed = JSON.parse(inlineJson)
      rememberProjectId(parsed)
      return cert(parsed)
    }
    if (filePath && fs.existsSync(filePath)) {
      console.log(`🔐 Using FIREBASE_SERVICE_ACCOUNT_FILE: ${filePath}`)
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      rememberProjectId(parsed)
      return cert(parsed)
    }
    const fallback = DEFAULT_SA_PATHS.find((p) => fs.existsSync(p))
    if (fallback) {
      console.log(`🔐 Using fallback service account path: ${fallback}`)
      const parsed = JSON.parse(fs.readFileSync(fallback, 'utf8'))
      rememberProjectId(parsed)
      return cert(parsed)
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
const PROJECT_ID =
  credentialProjectId || db.app?.options?.projectId || 'unknown-project'

function randomId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)
}

async function ensureMembership(app: AppDoc): Promise<MembershipResult> {
  const membershipRef = db
    .collection('apps')
    .doc(app.id)
    .collection('users')
    .doc(TARGET_UID)
  const snap = await membershipRef.get()
  const previousRole = snap.exists ? snap.data()?.role ?? null : null
  const created = !snap.exists

  if (DRY_RUN) {
    return { created, previousRole, nextRole: 'admin' }
  }

  const notification = {
    id: randomId(),
    message: `Global admin ensure for ${app.app_name || app.id}`,
    scope: 'app',
    app_id: app.id,
    read: false,
    created_at: new Date().toISOString(),
  }

  await membershipRef.set(
    {
      id: TARGET_UID,
      role: 'admin',
      creator_id: TARGET_UID,
      updated_at: FieldValue.serverTimestamp(),
      ...(created ? { created_at: FieldValue.serverTimestamp() } : {}),
      notifications: FieldValue.arrayUnion(notification),
    },
    { merge: true }
  )

  await db
    .collection('users')
    .doc(TARGET_UID)
    .set(
      {
        updated_at: FieldValue.serverTimestamp(),
        adminOf: FieldValue.arrayUnion(app.id),
        userOf: FieldValue.arrayUnion(app.id),
      },
      { merge: true }
    )

  return { created, previousRole, nextRole: 'admin' }
}

function shouldProcess(app: AppDoc): boolean {
  if (APP_FILTER.length && !APP_FILTER.includes(app.id)) {
    return false
  }
  if (INCLUDE_GLOBALS_ONLY) {
    return app.role === 'global'
  }
  if (INCLUDE_TENANTS_ONLY) {
    return app.role === 'tenant'
  }
  return true
}

async function ensureAdmin(app: AppDoc): Promise<AppSummary | null> {
  if (!shouldProcess(app)) return null

  const sanitizedAdmins = Array.isArray(app.admin_ids)
    ? app.admin_ids.filter((id) => typeof id === 'string' && id.trim())
    : []

  const alreadyAdmin = sanitizedAdmins.includes(TARGET_UID)
  const docRef = db.collection('apps').doc(app.id)
  let adminIdsUpdated = false

  if (!alreadyAdmin) {
    console.log(`- ${app.id}: adding ${TARGET_UID} to admin_ids`)
    if (!DRY_RUN) {
      await docRef.update({ admin_ids: FieldValue.arrayUnion(TARGET_UID) })
    }
    adminIdsUpdated = true
  } else {
    console.log(`- ${app.id}: already lists ${TARGET_UID} as admin`)
  }

  const membership = await ensureMembership(app)
  console.log(
    `  • membership ${membership.created ? 'created' : 'updated'} (prev=${
      membership.previousRole ?? 'none'
    })`
  )

  return {
    appId: app.id,
    appName: app.app_name,
    adminIdsUpdated,
    membership,
  }
}

async function main() {
  console.log('\n=== Ensure Global Admin ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`)
  console.log(`Target UID: ${TARGET_UID}`)
  if (APP_FILTER.length) {
    console.log(`Filtering apps: ${APP_FILTER.join(', ')}`)
  }
  if (INCLUDE_GLOBALS_ONLY) console.log('Scope: global apps only')
  if (INCLUDE_TENANTS_ONLY) console.log('Scope: tenant apps only')

  const appsSnapshot = await db.collection('apps').get()
  if (appsSnapshot.empty) {
    console.log('No apps found. Exiting.')
    return
  }

  const summary: AppSummary[] = []

  for (const doc of appsSnapshot.docs) {
    const data = doc.data() as AppDoc
    const app: AppDoc = {
      id: doc.id,
      app_name: data.app_name,
      admin_ids: data.admin_ids,
      role: data.role,
      ecosystem: data.ecosystem,
    }

    const result = await ensureAdmin(app)
    if (result) {
      summary.push(result)
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    targetUid: TARGET_UID,
    appsProcessed: summary.length,
    summary,
  }

  const outDir = path.resolve('migrations/backups')
  fs.mkdirSync(outDir, { recursive: true })
  const dateStamp = new Date().toISOString().slice(0, 10)
  const safeProject = PROJECT_ID.replace(/[^a-zA-Z0-9-]/g, '_')
  const outPath = path.join(
    outDir,
    `ensure-global-admin-${safeProject}-${dateStamp}.json`
  )
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\n📄 Summary written to ${outPath}`)
  console.log('Done.')
}

main().catch((error) => {
  console.error('Ensure global admin script failed:', error)
  process.exit(1)
})
