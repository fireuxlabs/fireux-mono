#!/usr/bin/env tsx

/**
 * Remove the `supplier` role from every user's `profiles` array.
 *
 * Examples:
 *   pnpm tsx automation/maintenance/remove-supplier-profile.ts --project=misebox --yes
 *   pnpm tsx automation/maintenance/remove-supplier-profile.ts --project=fireux --dry-run
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  applicationDefault,
  cert,
  deleteApp,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

interface ProjectConfig {
  key: string
  name: string
  projectId: string
  serviceAccountPath: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

const PROJECTS: Record<string, ProjectConfig> = {
  misebox: {
    key: 'misebox',
    name: 'MiseBox',
    projectId: 'misebox-78f9c',
    serviceAccountPath: path.join(
      repoRoot,
      'packages',
      'ecosystem',
      'fireux-misebox',
      'config',
      'service-account.json'
    ),
  },
  fireux: {
    key: 'fireux',
    name: 'FireUX',
    projectId: 'fireux-2005',
    serviceAccountPath: path.join(
      repoRoot,
      'packages',
      'ecosystem',
      'fireux-fireux',
      'config',
      'service-account.json'
    ),
  },
  cleanbox: {
    key: 'cleanbox',
    name: 'CleanBox',
    projectId: 'cleanbox-f15bc',
    serviceAccountPath: path.join(
      repoRoot,
      'packages',
      'ecosystem',
      'fireux-cleanbox',
      'config',
      'service-account.json'
    ),
  },
}

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  printHelp()
  process.exit(0)
}

const projectKey = readFlagValue('--project') ?? 'misebox'
const project = PROJECTS[projectKey]
if (!project) {
  console.error(
    `Unknown project "${projectKey}". Available: ${Object.keys(PROJECTS).join(', ')}`
  )
  process.exit(1)
}

const apply = argv.includes('--yes') || argv.includes('--apply')
const dryRun = argv.includes('--dry-run') || !apply
const silent = argv.includes('--quiet') || argv.includes('--silent')

const limitFlag = readFlagValue('--limit')
const limit = limitFlag ? Number(limitFlag) : undefined
if (limitFlag && Number.isNaN(limit)) {
  console.error('Invalid --limit value. Expected a number.')
  process.exit(1)
}

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `remove-supplier-profile-${project.projectId}-${Date.now()}`
)

try {
  const db = getFirestore(app)
  let query = db.collection('users').where('profiles', 'array-contains', 'supplier')
  if (limit && limit > 0) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()
  const targets = snapshot.docs

  if (!targets.length) {
    if (!silent) {
      console.log('[remove-supplier-profile] No users with supplier role found.')
    }
    process.exit(0)
  }

  const preview = targets.map((doc) => {
    const data = doc.data()
    const profiles = Array.isArray(data.profiles) ? data.profiles : []
    return {
      id: doc.id,
      before: profiles,
      after: profiles.filter((role) => role !== 'supplier'),
    }
  })

  if (!silent) {
    console.log(
      `[remove-supplier-profile] identified ${targets.length} user${
        targets.length === 1 ? '' : 's'
      } with supplier role`
    )
    console.log(JSON.stringify(preview, null, 2))
  }

  if (dryRun) {
    if (!silent) {
      console.log(
        '[remove-supplier-profile] dry run complete. Re-run with --yes to apply changes.'
      )
    }
    process.exit(0)
  }

  let updated = 0
  for (const doc of targets) {
    await doc.ref.update({
      profiles: FieldValue.arrayRemove('supplier'),
    })
    updated++
    if (!silent) {
      console.log(`[remove-supplier-profile] cleaned users/${doc.id}`)
    }
  }

  if (!silent) {
    console.log(
      `[remove-supplier-profile] Completed. Updated ${updated} document${updated === 1 ? '' : 's'}.`
    )
  }
} catch (error) {
  console.error('[remove-supplier-profile] failed.', error)
  process.exitCode = 1
} finally {
  await deleteApp(app).catch(() => undefined)
}

function loadCredential(projectConfig: ProjectConfig) {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const fileEnv = process.env.FIREBASE_SERVICE_ACCOUNT_FILE

  try {
    if (inlineJson) {
      return cert(JSON.parse(inlineJson) as ServiceAccount)
    }

    if (fileEnv && fs.existsSync(fileEnv)) {
      return cert(JSON.parse(fs.readFileSync(fileEnv, 'utf8')) as ServiceAccount)
    }

    if (fs.existsSync(projectConfig.serviceAccountPath)) {
      return cert(
        JSON.parse(fs.readFileSync(projectConfig.serviceAccountPath, 'utf8')) as ServiceAccount
      )
    }

    return applicationDefault()
  } catch (error) {
    console.error('[remove-supplier-profile] failed to load Firebase credentials.')
    throw error
  }
}

function readFlagValue(flag: string): string | undefined {
  const equalsPrefix = `${flag}=`
  for (let i = 0; i < argv.length; i++) {
    const entry = argv[i]
    if (entry === flag) {
      return argv[i + 1]
    }
    if (entry.startsWith(equalsPrefix)) {
      return entry.slice(equalsPrefix.length)
    }
  }
  return undefined
}

function printHelp() {
  console.log('\nUsage: pnpm tsx automation/maintenance/remove-supplier-profile.ts [options]')
  console.log('\nOptions:')
  console.log('  --project <name>   Target project key (misebox, fireux, cleanbox). Default: misebox')
  console.log('  --limit <number>   Process at most N users (for testing). Optional.')
  console.log('  --yes | --apply    Apply changes. Without this flag the script runs in dry-run mode.')
  console.log('  --dry-run          Force dry-run even if --yes is present.')
  console.log('  --quiet            Suppress verbose logging.')
  console.log('  --help             Show this message.')
}
