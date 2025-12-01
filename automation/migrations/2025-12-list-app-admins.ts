#!/usr/bin/env ts-node

/**
 * List each app document and its admin_ids for auditing.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_FILE=path/to/service-account.json \
 *   pnpm tsx automation/migrations/2025-12-list-app-admins.ts [--app <id>] [--globals-only|--tenants-only]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

interface AppDoc {
  id: string
  app_name?: string
  admin_ids?: string[]
  role?: string
  ecosystem?: string
}

const args = process.argv.slice(2)
const APP_FILTERS = collectMulti('--app')
const ONLY_GLOBALS = args.includes('--globals-only')
const ONLY_TENANTS = args.includes('--tenants-only')

if (ONLY_GLOBALS && ONLY_TENANTS) {
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

function matchesFilters(app: AppDoc): boolean {
  if (APP_FILTERS.length && !APP_FILTERS.includes(app.id)) return false
  if (ONLY_GLOBALS) return app.role === 'global'
  if (ONLY_TENANTS) return app.role === 'tenant'
  return true
}

function normalizeAdminIds(ids?: string[]): string[] {
  if (!Array.isArray(ids)) return []
  return Array.from(
    new Set(
      ids
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id) => id.length > 0)
    )
  )
}

async function main() {
  console.log('\n=== App Admin Inventory ===')
  if (APP_FILTERS.length) {
    console.log(`Filtering apps: ${APP_FILTERS.join(', ')}`)
  }
  if (ONLY_GLOBALS) console.log('Scope: global apps only')
  if (ONLY_TENANTS) console.log('Scope: tenant apps only')

  const snap = await db.collection('apps').get()
  if (snap.empty) {
    console.log('No apps found; exiting.')
    return
  }

  const results: AppDoc[] = []

  for (const doc of snap.docs) {
    const data = doc.data() as AppDoc
    const app: AppDoc = {
      id: doc.id,
      app_name: data.app_name,
      admin_ids: normalizeAdminIds(data.admin_ids),
      role: data.role,
      ecosystem: data.ecosystem,
    }

    if (!matchesFilters(app)) continue
    results.push(app)
  }

  if (!results.length) {
    console.log('No apps matched filters.')
    return
  }

  results.sort((a, b) => a.id.localeCompare(b.id))

  results.forEach((app) => {
    console.log('\n---')
    console.log(`App: ${app.id} (${app.app_name || 'Unnamed'})`)
    console.log(
      `Role: ${app.role || 'n/a'} | Ecosystem: ${app.ecosystem || 'n/a'}`
    )
    if (!app.admin_ids?.length) {
      console.log('Admins: none')
    } else {
      app.admin_ids.forEach((uid, index) => {
        console.log(`Admin #${index + 1}: ${uid}`)
      })
    }
  })

  console.log('\nTotal apps listed:', results.length)
}

main().catch((error) => {
  console.error('Inventory failed:', error)
  process.exit(1)
})
