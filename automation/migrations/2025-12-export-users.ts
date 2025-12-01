#!/usr/bin/env ts-node

/**
 * Export all core users plus every apps/{appId}/users overlay in a Firebase project.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_FILE=path/to/service-account.json \
 *   pnpm tsx automation/migrations/2025-12-export-users.ts [--app <id>] [--core-only] [--apps-only]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

interface ExportUserDoc {
  id: string
  [key: string]: unknown
}

interface AppExport {
  id: string
  data: Record<string, unknown>
  members: ExportUserDoc[]
}

const args = process.argv.slice(2)
const APP_FILTERS = collectMulti('--app')
const CORE_ONLY = args.includes('--core-only')
const APPS_ONLY = args.includes('--apps-only')

if (CORE_ONLY && APPS_ONLY) {
  console.error('❌ Cannot combine --core-only and --apps-only flags.')
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

function rememberProjectId(payload: any) {
  if (
    payload &&
    typeof payload === 'object' &&
    payload.project_id &&
    typeof payload.project_id === 'string'
  ) {
    credentialProjectId = payload.project_id
  }
}

function loadCredential() {
  try {
    const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (inlineJson) {
      const parsed = JSON.parse(inlineJson)
      rememberProjectId(parsed)
      return cert(parsed)
    }
    if (filePath && fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      rememberProjectId(parsed)
      return cert(parsed)
    }
    const fallback = DEFAULT_SA_PATHS.find((p) => fs.existsSync(p))
    if (fallback) {
      const parsed = JSON.parse(fs.readFileSync(fallback, 'utf8'))
      rememberProjectId(parsed)
      return cert(parsed)
    }
    console.log('🛈 No service account supplied; falling back to ADC.')
    return applicationDefault()
  } catch (error) {
    console.error('Failed to load Firebase credentials.')
    throw error
  }
}

initializeApp({ credential: loadCredential() })
const db = getFirestore()
const PROJECT_ID =
  credentialProjectId || db.app?.options?.projectId || 'unknown-project'

function normalize(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalize(entry))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>(
      (acc, [key, entry]) => {
        acc[key] = normalize(entry)
        return acc
      },
      {}
    )
  }
  return value
}

function normalizeDoc(doc: FirebaseFirestore.DocumentSnapshot): ExportUserDoc {
  return {
    id: doc.id,
    ...(normalize(doc.data()) as Record<string, unknown>),
  }
}

async function exportCoreUsers(): Promise<ExportUserDoc[]> {
  const snapshot = await db.collection('users').get()
  return snapshot.docs.map((doc) => normalizeDoc(doc))
}

async function exportApp(appId: string): Promise<AppExport> {
  const docRef = db.collection('apps').doc(appId)
  const docSnap = await docRef.get()
  const baseData = docSnap.exists
    ? (normalize(docSnap.data()) as Record<string, unknown>)
    : {}

  const membersSnap = await docRef.collection('users').get()
  const members = membersSnap.docs.map((doc) => normalizeDoc(doc))

  return { id: appId, data: baseData, members }
}

async function exportApps(): Promise<AppExport[]> {
  const appsSnapshot = await db.collection('apps').get()
  const targets = appsSnapshot.docs
    .map((doc) => doc.id)
    .filter((id) => (APP_FILTERS.length ? APP_FILTERS.includes(id) : true))
    .sort()

  const results: AppExport[] = []
  for (const appId of targets) {
    const appExport = await exportApp(appId)
    results.push(appExport)
  }
  return results
}

async function main() {
  console.log('\n=== Export Users ===')
  console.log(`Project: ${PROJECT_ID}`)
  if (APP_FILTERS.length) {
    console.log(`Limiting apps: ${APP_FILTERS.join(', ')}`)
  }

  const payload: {
    projectId: string
    generatedAt: string
    coreUsers?: ExportUserDoc[]
    apps?: AppExport[]
  } = {
    projectId: PROJECT_ID,
    generatedAt: new Date().toISOString(),
  }

  if (!APPS_ONLY) {
    payload.coreUsers = await exportCoreUsers()
    console.log(`Core users exported: ${payload.coreUsers.length}`)
  }

  if (!CORE_ONLY) {
    payload.apps = await exportApps()
    console.log(`Apps exported: ${payload.apps.length}`)
  }

  const outDir = path.resolve('migrations/backups')
  fs.mkdirSync(outDir, { recursive: true })
  const dateStamp = new Date().toISOString().slice(0, 10)
  const safeProject = PROJECT_ID.replace(/[^a-zA-Z0-9-]/g, '_')
  const outPath = path.join(
    outDir,
    `users-export-${safeProject}-${dateStamp}.json`
  )
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2))
  console.log(`\n📄 Export written to ${outPath}`)
}

main().catch((error) => {
  console.error('User export failed:', error)
  process.exit(1)
})
