#!/usr/bin/env tsx

/**
 * Backup core-users collection for FireUX projects.
 *
 * Usage examples:
 *   pnpm tsx automation/maintenance/backup-core-users.ts --project=misebox
 *   pnpm tsx automation/maintenance/backup-core-users.ts --project=misebox --outDir=./tmp
 *
 * Credentials precedence:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON (inline JSON)
 *   2. FIREBASE_SERVICE_ACCOUNT_FILE (path to JSON)
 *   3. Conventional repo path per project (see PROJECTS map)
 *   4. Application Default Credentials (gcloud auth application-default login)
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  initializeApp,
  cert,
  applicationDefault,
  deleteApp,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const fsp = fs.promises

interface ProjectConfig {
  key: string
  name: string
  projectId: string
  serviceAccountPath: string
  appId: string
}

const PROJECTS: Record<string, ProjectConfig> = {
  misebox: {
    key: 'misebox',
    name: 'MiseBox',
    projectId: 'misebox-78f9c',
    serviceAccountPath: path.join(
      repoRoot,
      'packages',
      'tenants',
      'fireux-misebox',
      'config',
      'service-account.json'
    ),
    appId: 'misebox-app',
  },
  fireux: {
    key: 'fireux',
    name: 'FireUX',
    projectId: 'fireux-2005',
    serviceAccountPath: path.join(
      repoRoot,
      'projects',
      'fireux',
      'fireux-app',
      'config',
      'service-account.json'
    ),
    appId: 'fireux-app',
  },
  cleanbox: {
    key: 'cleanbox',
    name: 'CleanBox',
    projectId: 'cleanbox-f15bc',
    serviceAccountPath: path.join(
      repoRoot,
      'packages',
      'tenants',
      'fireux-cleanbox',
      'config',
      'service-account.json'
    ),
    appId: 'cleanbox-app',
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
    `Unknown project "${projectKey}". Available: ${Object.keys(PROJECTS).join(
      ', '
    )}`
  )
  process.exit(1)
}

const outDirFromFlags = readFlagValue('--outDir')
const outDir = outDirFromFlags
  ? path.resolve(process.cwd(), outDirFromFlags)
  : path.join(repoRoot, 'migrations', 'backups')

const includeSlim = !argv.includes('--no-slim')
const collectionName = readFlagValue('--collection') ?? 'core-users'

function slugifyCollection(value: string): string {
  const replaced = value.replaceAll(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  const trimmed = replaced.replaceAll(/^-+/g, '').replaceAll(/-+$/g, '')
  return trimmed || 'collection'
}

async function main() {
  console.log(
    `\n=== Backup ${collectionName} for ${project.name} (${project.projectId}) ===`
  )
  console.log(`Collection: ${collectionName}`)
  console.log(`Output dir: ${outDir}`)

  const { db, app } = initializeFirestore(project)

  const snapshot = await db.collection(collectionName).get()
  if (snapshot.empty) {
    console.warn(
      `Warning: no documents found in ${collectionName}. Nothing to back up.`
    )
    await deleteApp(app).catch(() => undefined)
    return
  }

  const exportedAt = new Date().toISOString()
  const users = snapshot.docs.map((doc) =>
    normalize({ id: doc.id, ...doc.data() })
  )

  await fsp.mkdir(outDir, { recursive: true })

  const dateStamp = exportedAt.slice(0, 10)
  const collectionSlug = slugifyCollection(collectionName)
  const baseName = `backup-${project.appId}-${collectionSlug}-${dateStamp}`
  const fullPath = path.join(outDir, `${baseName}.json`)

  const fullPayload = {
    project: project.projectId,
    appId: project.appId,
    collection: collectionName,
    exportedAt,
    total: users.length,
    users,
  }

  await fsp.writeFile(fullPath, JSON.stringify(fullPayload, null, 2))
  console.log(`Full backup written (${users.length} docs): ${fullPath}`)

  if (includeSlim) {
    const slimUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email ?? null,
      display_name: user.display_name ?? null,
      handle: user.handle ?? null,
      adminOf: user.adminOf ?? [],
      userOf: user.userOf ?? [],
      created_at: user.created_at ?? null,
      updated_at: user.updated_at ?? null,
    }))

    const slimPath = path.join(outDir, `${baseName}-slim.json`)
    await fsp.writeFile(
      slimPath,
      JSON.stringify(
        {
          project: project.projectId,
          collection: collectionName,
          total: slimUsers.length,
          users: slimUsers,
        },
        null,
        2
      )
    )
    console.log(`Slim backup written: ${slimPath}`)
  }

  await deleteApp(app).catch(() => undefined)

  console.log('\nBackup complete!')
}

function initializeFirestore(projectConfig: ProjectConfig) {
  const credential = loadCredential(projectConfig)
  const app = initializeApp(
    {
      credential,
      projectId: projectConfig.projectId,
    },
    projectConfig.projectId
  )
  const db = getFirestore(app)
  return { db, app }
}

function loadCredential(projectConfig: ProjectConfig) {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const fileEnv = process.env.FIREBASE_SERVICE_ACCOUNT_FILE

  try {
    if (inlineJson) {
      console.log('Using FIREBASE_SERVICE_ACCOUNT_JSON env.')
      return cert(JSON.parse(inlineJson) as ServiceAccount)
    }

    if (fileEnv && fs.existsSync(fileEnv)) {
      console.log(`Using FIREBASE_SERVICE_ACCOUNT_FILE: ${fileEnv}`)
      return cert(
        JSON.parse(fs.readFileSync(fileEnv, 'utf8')) as ServiceAccount
      )
    }

    if (fs.existsSync(projectConfig.serviceAccountPath)) {
      console.log(
        `Using conventional service account path: ${projectConfig.serviceAccountPath}`
      )
      return cert(
        JSON.parse(
          fs.readFileSync(projectConfig.serviceAccountPath, 'utf8')
        ) as ServiceAccount
      )
    }

    console.log(
      'Info: no service account credentials provided. Falling back to Application Default Credentials (ADC).'
    )
    return applicationDefault()
  } catch (error) {
    console.error('\nFailed to load Firebase credentials.')
    console.error('Provide credentials via one of:')
    console.error(
      '  export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"'
    )
    console.error(
      '  export FIREBASE_SERVICE_ACCOUNT_FILE=./path/to/service-account.json'
    )
    console.error(`  place the file at ${projectConfig.serviceAccountPath}`)
    console.error('  or run: gcloud auth application-default login')
    throw error
  }
}

function normalize(value: any): any {
  if (value instanceof Timestamp) {
    return {
      type: 'firestore/timestamp/1.0',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }

  if (Array.isArray(value)) {
    return value.map(normalize)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalize(val)])
    )
  }

  return value
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
  console.log(
    `\nUsage: pnpm tsx automation/maintenance/backup-core-users.ts [--project=<name>] [--collection=<name>] [--outDir=<path>] [--no-slim]`
  )
  console.log('\nOptions:')
  console.log(
    '  --project <name>  Project key (fireux, misebox, cleanbox). Default: misebox'
  )
  console.log(
    `  --collection <name> Firestore collection to export. Default: ${collectionName}`
  )
  console.log(
    '  --outDir <path>   Directory for backup files. Default: migrations/backups (gitignored)'
  )
  console.log('  --no-slim         Skip the slim backup file')
  console.log('  --help            Show this message')
}

try {
  await main()
} catch (error) {
  console.error('\nBackup failed:', error)
  process.exit(1)
}
