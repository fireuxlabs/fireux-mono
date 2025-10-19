import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import type { ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { Auth, UserRecord } from 'firebase-admin/auth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function parseArgs(): { ecosystem?: string; serviceAccountPath?: string } {
  const args = process.argv.slice(2)
  let ecosystem: string | undefined
  let serviceAccountPath: string | undefined

  for (const arg of args) {
    if (arg.startsWith('--service-account=')) {
      serviceAccountPath = arg.split('=')[1]
    } else if (!ecosystem) {
      ecosystem = arg
    }
  }

  return { ecosystem, serviceAccountPath }
}

async function ensureAdminApp(serviceAccountPath: string): Promise<void> {
  if (getApps().length) return

  const json = readFileSync(serviceAccountPath, 'utf-8')
  const serviceAccount = JSON.parse(json) as ServiceAccount
  initializeApp({ credential: cert(serviceAccount) })
}

async function purgeUsers(options: {
  ecosystem?: string
  serviceAccountPath?: string
}) {
  const repoRoot = resolve(__dirname, '..', '..')
  const serviceAccountPath =
    options.serviceAccountPath ??
    (options.ecosystem
      ? resolve(
          repoRoot,
          `packages/tenants/fireux-${options.ecosystem}/config/service-account.json`
        )
      : undefined)

  if (!serviceAccountPath) {
    throw new Error(
      'Usage: pnpm tsx automation/maintenance/purge-anon-users.ts <ecosystem> [--service-account=/path/to/service-account.json]'
    )
  }

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      `[purge-anon-users] Service account file not found at ${serviceAccountPath}`
    )
  }

  await ensureAdminApp(serviceAccountPath)

  const auth: Auth = getAuth()
  let nextPageToken: string | undefined
  let total = 0
  let totalTestAccounts = 0

  do {
    const page = await auth.listUsers(1000, nextPageToken)
    const flaggedUsers = page.users.filter((user: UserRecord) => {
      const hasProviders = Array.isArray(user.providerData)
        ? user.providerData.length > 0
        : false
      const email = user.email?.trim() ?? ''
      const hasEmail = Boolean(email)
      const isDisabled = user.disabled === true
      const emailLooksTest = email
        ? email.toLowerCase().includes('test')
        : false
      const shouldDelete =
        (!hasProviders && !hasEmail && !isDisabled) || emailLooksTest
      if (shouldDelete && emailLooksTest) totalTestAccounts += 1
      return shouldDelete
    })

    if (flaggedUsers.length) {
      // deleteUsers caps at 100 identifiers per call
      const chunkSize = 100
      for (let i = 0; i < flaggedUsers.length; i += chunkSize) {
        const slice = flaggedUsers.slice(i, i + chunkSize)
        const result = await auth.deleteUsers(
          slice.map((u: UserRecord) => u.uid)
        )
        total += result.successCount
        if (result.failureCount && result.errors?.length) {
          console.warn('[purge-anon-users] partial failures', {
            failures: result.failureCount,
            errors: result.errors,
          })
        }
      }
      console.log(
        `[purge-anon-users] removed ${flaggedUsers.length} users this batch (running total: ${total})`
      )
    }

    nextPageToken = page.pageToken
  } while (nextPageToken)

  console.log(
    `[purge-anon-users] completed. Total users removed: ${total}; of which ${totalTestAccounts} matched 'test' emails.`
  )
}

try {
  const options = parseArgs()
  await purgeUsers(options)
} catch (err) {
  console.error('[purge-anon-users] failed', err)
  process.exitCode = 1
}
