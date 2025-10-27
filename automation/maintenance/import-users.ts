#!/usr/bin/env tsx

/**
 * Upsert user documents into the top-level `users` collection for a target project.
 *
 * Example:
 *   pnpm tsx automation/maintenance/import-users.ts --project=misebox --input=./data/users.json
 *   pnpm tsx automation/maintenance/import-users.ts --project=misebox --input=./data/users.json --dry-run
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  initializeApp,
  deleteApp,
  cert,
  applicationDefault,
  type ServiceAccount,
} from 'firebase-admin/app'
import {
  getFirestore,
  Timestamp,
  type DocumentData,
} from 'firebase-admin/firestore'

interface UserPayload {
  id: string
  [key: string]: unknown
}

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
      'tenants',
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
      'projects',
      'fireux',
      'fireux-app',
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
      'tenants',
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
    `Unknown project "${projectKey}". Available: ${Object.keys(PROJECTS).join(
      ', '
    )}`
  )
  process.exit(1)
}

const inputPath = readFlagValue('--input')
if (!inputPath) {
  console.error('Missing --input <path> argument.')
  process.exit(1)
}

const absoluteInputPath = path.resolve(process.cwd(), inputPath)
if (!fs.existsSync(absoluteInputPath)) {
  console.error(`Input file not found: ${absoluteInputPath}`)
  process.exit(1)
}

const dryRun = argv.includes('--dry-run')

const rawJson = fs.readFileSync(absoluteInputPath, 'utf8')
let records: UserPayload[]
try {
  const parsed = JSON.parse(rawJson)
  if (!Array.isArray(parsed)) {
    throw new Error('Input JSON must be an array of user payloads.')
  }
  records = parsed as UserPayload[]
} catch (error) {
  console.error('Failed to parse input JSON.', error)
  process.exit(1)
}

console.log(
  `\nImporting ${records.length} user records into project ${project.name} (${project.projectId})`
)
console.log(`Input file: ${absoluteInputPath}`)
console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'APPLY'}`)

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `import-users-${project.projectId}-${Date.now()}`
)
const db = getFirestore(app)

let success = 0
let skipped = 0
const failures: Array<{ id: string; error: unknown }> = []

for (const record of records) {
  const { id, ...rest } = record
  if (!id || typeof id !== 'string') {
    skipped++
    console.warn('Skipping record with missing or invalid id field.', record)
    continue
  }

  try {
    const payload = transformValue(rest) as DocumentData

    if (dryRun) {
      console.log(`[dry-run] would upsert users/${id}`)
      continue
    }

    await db.collection('users').doc(id).set(payload, { merge: true })
    success++
    console.log(`Upserted users/${id}`)
  } catch (error) {
    failures.push({ id, error })
    console.error(`Failed to upsert users/${id}:`, error)
  }
}

await deleteApp(app).catch(() => undefined)

console.log('\nImport summary:')
console.log(`  total:    ${records.length}`)
console.log(`  success:  ${success}`)
console.log(`  skipped:  ${skipped}`)
console.log(`  failures: ${failures.length}`)

if (failures.length > 0) {
  console.log('\nFailures:')
  for (const entry of failures) {
    console.log(`  - ${entry.id}:`, entry.error)
  }
  process.exit(1)
}

function transformValue(input: unknown): unknown {
  if (input == null) return input

  if (Array.isArray(input)) {
    return input.map((item) => transformValue(item))
  }

  if (typeof input === 'object') {
    if (isTimestampLike(input)) {
      return toTimestamp(input as TimestampLike)
    }

    if (input instanceof Timestamp) {
      return input
    }

    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, transformValue(value)])
    )
  }

  if (typeof input === 'string') {
    const maybeDate = Date.parse(input)
    if (!Number.isNaN(maybeDate)) {
      return Timestamp.fromDate(new Date(maybeDate))
    }
  }

  return input
}

type TimestampLike = {
  type?: string
  seconds?: number
  nanoseconds?: number
}

function isTimestampLike(value: unknown): value is TimestampLike {
  if (!value || typeof value !== 'object') return false
  const candidate = value as TimestampLike
  return (
    candidate.type === 'firestore/timestamp/1.0' &&
    typeof candidate.seconds === 'number' &&
    typeof candidate.nanoseconds === 'number'
  )
}

function toTimestamp(value: TimestampLike): Timestamp {
  if (
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  ) {
    return new Timestamp(value.seconds, value.nanoseconds)
  }

  throw new Error('Invalid timestamp payload.')
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
    '\nUsage: pnpm tsx automation/maintenance/import-users.ts [options]'
  )
  console.log('\nOptions:')
  console.log(
    '  --project <name>   Target project key (misebox, fireux, cleanbox). Default: misebox'
  )
  console.log(
    '  --input <path>     Path to JSON array of user payloads (required)'
  )
  console.log(
    '  --dry-run          Validate and log without writing to Firestore'
  )
  console.log('  --help             Show this message')
}
