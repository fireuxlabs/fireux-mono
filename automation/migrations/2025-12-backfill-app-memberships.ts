#!/usr/bin/env ts-node

/**
 * Backfill app membership subcollections so every admin in apps/{appId}/admin_ids
 * has a matching apps/{appId}/users/{uid} document.
 *
 * Usage (per Firebase project):
 *   FIREBASE_SERVICE_ACCOUNT_FILE=path/to/service-account.json \
 *   node -r esbuild-register automation/migrations/2025-12-backfill-app-memberships.ts --dry-run
 *
 *   # Real run for all apps in the project
 *   node -r esbuild-register automation/migrations/2025-12-backfill-app-memberships.ts
 *
 *   # Limit to specific apps
 *   node -r esbuild-register automation/migrations/2025-12-backfill-app-memberships.ts --app cleanbox-app --app richies-reinigung
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
  uid: string
  created: boolean
  previousRole: string | null
  nextRole: 'admin'
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const APP_FILTER = collectMultiValue('--app')
const INCLUDE_GLOBALS_ONLY = args.includes('--globals-only')
const INCLUDE_TENANTS_ONLY = args.includes('--tenants-only')

if (INCLUDE_GLOBALS_ONLY && INCLUDE_TENANTS_ONLY) {
  console.error('❌ Cannot combine --globals-only and --tenants-only flags.')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DEFAULT_SA_PATHS = [
  path.resolve(__dirname, '../../packages/core/fireux-core/config/service-account.json'),
  path.resolve(__dirname, '../../projects/fireux/fireux-app/config/service-account.json'),
]

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

function loadCredential() {
  try {
    const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (inlineJson) {
      console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_JSON environment variable.')
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
    console.log('🛈 No service account supplied; falling back to Application Default Credentials.')
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

function randomId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)
}

async function ensureAdminMembership(app: AppDoc, uid: string): Promise<MembershipResult> {
  const membershipRef = db.collection('apps').doc(app.id).collection('users').doc(uid)
  const snap = await membershipRef.get()
  const previousRole = snap.exists ? (snap.data()?.role ?? null) : null
  const created = !snap.exists

  const notification = {
    id: randomId(),
    message: `Membership backfilled as admin for ${app.app_name || app.id}`,
    scope: 'app',
    app_id: app.id,
    read: false,
    created_at: new Date().toISOString(),
  }

  const membershipPayload = {
    id: uid,
    role: 'admin',
    creator_id: uid,
    updated_at: FieldValue.serverTimestamp(),
    ...(created ? { created_at: FieldValue.serverTimestamp() } : {}),
    notifications: FieldValue.arrayUnion(notification),
  }

  const userRef = db.collection('users').doc(uid)
  const userPayload = {
    updated_at: FieldValue.serverTimestamp(),
    userOf: FieldValue.arrayUnion(app.id),
    adminOf: FieldValue.arrayUnion(app.id),
  }

  if (DRY_RUN) {
    return { uid, created, previousRole, nextRole: 'admin' }
  }

  await membershipRef.set(membershipPayload, { merge: true })
  await userRef.set(userPayload, { merge: true })
  return { uid, created, previousRole, nextRole: 'admin' }
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

async function main() {
  console.log('\n=== Backfill App Memberships ===')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`)
  if (APP_FILTER.length) {
    console.log(`Filtering apps: ${APP_FILTER.join(', ')}`)
  }
  if (INCLUDE_GLOBALS_ONLY) console.log('Scope: global apps only')
  if (INCLUDE_TENANTS_ONLY) console.log('Scope: tenant apps only')

  const appsSnapshot = await db.collection('apps').get()
  if (appsSnapshot.empty) {
    console.log('No apps found in collection. Exiting.')
    return
  }

  const summary: Record<string, MembershipResult[]> = {}

  for (const doc of appsSnapshot.docs) {
    const data = doc.data() as AppDoc
    const app: AppDoc = {
      id: doc.id,
      app_name: data.app_name,
      admin_ids: Array.isArray(data.admin_ids)
        ? data.admin_ids.filter((id) => typeof id === 'string' && id.trim())
        : [],
      role: data.role,
      ecosystem: data.ecosystem,
    }

    if (!shouldProcess(app)) continue

    if (!app.admin_ids || !app.admin_ids.length) {
      console.log(`- ${app.id}: skipped (no admin_ids)`)
      continue
    }

    console.log(`- ${app.id}: ensuring ${app.admin_ids.length} admin membership(s)`)    
    summary[app.id] = []

    for (const uid of app.admin_ids) {
      try {
        const result = await ensureAdminMembership(app, uid)
        summary[app.id].push(result)
        console.log(
          `   • ${uid} → role=admin (${result.created ? 'created' : 'updated'}, prev=${result.previousRole ?? 'none'})`
        )
      } catch (error) {
        console.error(`   ⚠️ Failed to sync admin ${uid} for app ${app.id}:`, error)
      }
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    appsProcessed: Object.keys(summary).length,
    summary,
  }

  const outDir = path.resolve('migrations/backups')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(
    outDir,
    `backfill-app-memberships-${new Date().toISOString().slice(0, 10)}.json`
  )
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\n📄 Summary written to ${outPath}`)
  console.log('Done.')
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
