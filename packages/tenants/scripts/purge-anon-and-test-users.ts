import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { Auth, UserRecord, DeleteUsersResult } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { Firestore } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tenantsRoot = resolve(__dirname, '..')

interface CliOptions {
  ecosystems: string[]
  dryRun: boolean
  serviceAccountPath?: string
}

type FlaggedUser = {
  uid: string
  email: string | null
  displayName?: string | null
  reasons: string[]
}

type EcosystemSummary = {
  ecosystem: string
  authDeleted: number
  authFailed: number
  coreDeleted: number
  coreMissing: number
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const ecosystems: string[] = []
  let dryRun = false
  let serviceAccountPath: string | undefined

  for (const raw of args) {
    if (raw === '--dry-run') {
      dryRun = true
      continue
    }
    if (raw.startsWith('--ecosystem=')) {
      const value = raw.split('=')[1]?.trim()
      if (value) ecosystems.push(value)
      continue
    }
    if (raw.startsWith('--service-account=')) {
      serviceAccountPath = raw.split('=')[1]?.trim() || undefined
      continue
    }
    if (!raw.startsWith('--') && raw.trim().length) {
      ecosystems.push(raw.trim())
    }
  }

  return { ecosystems, dryRun, serviceAccountPath }
}

function listAvailableEcosystems(): string[] {
  return readdirSync(tenantsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('fireux-'))
    .map((entry) => entry.name.replace(/^fireux-/, ''))
}

function ensureUnique<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

function resolveServiceAccountPath(
  ecosystem: string,
  fallback?: string
): string | undefined {
  if (fallback) return fallback
  const tenantDir = resolve(tenantsRoot, `fireux-${ecosystem}`)
  return resolve(tenantDir, 'config', 'service-account.json')
}

function loadServiceAccount(path: string): ServiceAccount {
  const json = readFileSync(path, 'utf-8')
  return JSON.parse(json) as ServiceAccount
}

function ensureAdminApp(serviceAccountPath: string, appName: string): App {
  const existing = getApps().find((app) => app.name === appName)
  if (existing) return existing

  const serviceAccount = loadServiceAccount(serviceAccountPath)
  return initializeApp({ credential: cert(serviceAccount) }, appName)
}

function evaluateUser(user: UserRecord): FlaggedUser | null {
  const reasons: string[] = []
  const providers = Array.isArray(user.providerData)
    ? user.providerData.length
    : 0
  const email = user.email?.trim() ?? null
  const displayName = user.displayName?.trim() ?? null

  if (providers === 0 && !email && user.disabled !== true) {
    reasons.push('anonymous')
  }
  if (email?.toLowerCase().includes('test')) {
    reasons.push('email:test')
  }
  if (displayName?.toLowerCase().includes('test')) {
    reasons.push('displayName:test')
  }

  if (!reasons.length) return null

  return {
    uid: user.uid,
    email,
    displayName,
    reasons,
  }
}

async function collectFlaggedUsers(auth: Auth): Promise<FlaggedUser[]> {
  const flagged: FlaggedUser[] = []
  let nextPageToken: string | undefined

  do {
    const page = await auth.listUsers(1000, nextPageToken)
    for (const user of page.users) {
      const match = evaluateUser(user)
      if (match) {
        flagged.push(match)
      }
    }
    nextPageToken = page.pageToken
  } while (nextPageToken)

  return flagged
}

async function deleteAuthUsers(
  auth: Auth,
  ecosystem: string,
  users: FlaggedUser[],
  dryRun: boolean
): Promise<Pick<EcosystemSummary, 'authDeleted' | 'authFailed'>> {
  if (!users.length) {
    return { authDeleted: 0, authFailed: 0 }
  }

  if (dryRun) {
    console.log(
      `[${ecosystem}] dry-run: would delete ${users.length} auth user(s)`
    )
    return { authDeleted: 0, authFailed: 0 }
  }

  let deleted = 0
  let failed = 0
  const chunkSize = 100

  for (let i = 0; i < users.length; i += chunkSize) {
    const slice = users.slice(i, i + chunkSize)
    const result: DeleteUsersResult = await auth.deleteUsers(
      slice.map((user) => user.uid)
    )
    deleted += result.successCount
    failed += result.failureCount
    if (result.failureCount && result.errors?.length) {
      console.warn(`[${ecosystem}] auth delete partial failures`, {
        failures: result.failureCount,
        errors: result.errors,
      })
    }
  }

  return { authDeleted: deleted, authFailed: failed }
}

async function deleteCoreUsers(
  firestore: Firestore,
  ecosystem: string,
  users: FlaggedUser[],
  dryRun: boolean
): Promise<Pick<EcosystemSummary, 'coreDeleted' | 'coreMissing'>> {
  if (!users.length) {
    return { coreDeleted: 0, coreMissing: 0 }
  }

  let deleted = 0
  let missing = 0

  for (const user of users) {
    const ref = firestore.doc(`core-users/${user.uid}`)

    if (dryRun) {
      const snapshot = await ref.get()
      if (snapshot.exists) {
        console.log(
          `[${ecosystem}] dry-run: would delete core-users/${user.uid}`
        )
      } else {
        missing += 1
      }
      continue
    }

    const snapshot = await ref.get()
    if (!snapshot.exists) {
      missing += 1
      continue
    }

    await ref.delete()
    deleted += 1
  }

  return { coreDeleted: deleted, coreMissing: missing }
}

async function processEcosystem(
  ecosystem: string,
  options: CliOptions
): Promise<EcosystemSummary | null> {
  const serviceAccountPath = resolveServiceAccountPath(
    ecosystem,
    options.serviceAccountPath
  )

  if (!serviceAccountPath || !existsSync(serviceAccountPath)) {
    console.warn(
      `[${ecosystem}] skipped: service account not found at ${serviceAccountPath}`
    )
    return null
  }

  const appName = `purge-${ecosystem}`
  const app = ensureAdminApp(serviceAccountPath, appName)
  const auth = getAuth(app)
  const firestore = getFirestore(app)

  console.log(`[${ecosystem}] scanning auth users…`)
  const flagged = await collectFlaggedUsers(auth)

  if (!flagged.length) {
    console.log(`[${ecosystem}] no matching auth users found.`)
    return {
      ecosystem,
      authDeleted: 0,
      authFailed: 0,
      coreDeleted: 0,
      coreMissing: 0,
    }
  }

  console.log(`[${ecosystem}] found ${flagged.length} auth user(s) to delete.`)
  for (const user of flagged.slice(0, 10)) {
    console.log(
      `[${ecosystem}] candidate ${user.uid} reasons=${user.reasons.join(', ')}`
    )
  }
  if (flagged.length > 10) {
    console.log(`[${ecosystem}] …and ${flagged.length - 10} more.`)
  }

  const authSummary = await deleteAuthUsers(
    auth,
    ecosystem,
    flagged,
    options.dryRun
  )

  const coreSummary = await deleteCoreUsers(
    firestore,
    ecosystem,
    flagged,
    options.dryRun
  )

  return {
    ecosystem,
    authDeleted: authSummary.authDeleted,
    authFailed: authSummary.authFailed,
    coreDeleted: coreSummary.coreDeleted,
    coreMissing: coreSummary.coreMissing,
  }
}

async function run(): Promise<void> {
  const options = parseArgs()
  let ecosystems = ensureUnique(options.ecosystems)

  if (!ecosystems.length) {
    ecosystems = listAvailableEcosystems()
  }

  if (!ecosystems.length) {
    console.error('[purge] no tenant ecosystems detected. Aborting.')
    process.exitCode = 1
    return
  }

  const summaries: EcosystemSummary[] = []

  for (const ecosystem of ecosystems) {
    try {
      const summary = await processEcosystem(ecosystem, options)
      if (summary) summaries.push(summary)
    } catch (error) {
      console.error(`[${ecosystem}] failed`, error)
      process.exitCode = 1
    }
  }

  if (!summaries.length) {
    console.log('[purge] nothing to report.')
    return
  }

  console.log('\n[purge] summary')
  for (const summary of summaries) {
    console.log(
      `  - ${summary.ecosystem}: auth deleted=${summary.authDeleted} failed=${summary.authFailed}; core deleted=${summary.coreDeleted} missing=${summary.coreMissing}`
    )
  }

  if (options.dryRun) {
    console.log('[purge] dry-run complete. No mutations were applied.')
  }
}

try {
  await run()
} catch (error) {
  console.error('[purge] unhandled error', error)
  process.exitCode = 1
}
