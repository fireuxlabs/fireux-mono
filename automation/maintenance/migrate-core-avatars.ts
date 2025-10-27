#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  applicationDefault,
  cert,
  deleteApp,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

interface ProjectConfig {
  key: string
  name: string
  projectId: string
  serviceAccountPath: string
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

interface AvatarTask {
  uid: string
  sourcePath: string
  destinationPath: string
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

const bucketName =
  readFlagValue('--bucket') ?? `${project.projectId}.appspot.com`
const sourcePrefixInput = readFlagValue('--source') ?? 'core-users'
const destinationPrefixInput = readFlagValue('--dest') ?? 'users'
const dryRun = argv.includes('--dry-run')
const deleteSource = argv.includes('--delete-source')

const concurrencyInput = readFlagValue('--concurrency') ?? '5'
const concurrency = Number.parseInt(concurrencyInput, 10)
if (Number.isNaN(concurrency) || concurrency < 1) {
  console.error(
    `Invalid --concurrency value "${concurrencyInput}". Expected positive integer.`
  )
  process.exit(1)
}

const sourcePrefix = normalizePrefix(sourcePrefixInput)
const destinationPrefix = normalizePrefix(destinationPrefixInput)

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `migrate-avatars-${project.projectId}-${Date.now()}`
)
const storage = getStorage(app)
const bucket = storage.bucket(bucketName)

interface Summary {
  migrated: number
  skippedExisting: number
  skippedMissingAvatar: number
  dryRunPlanned: number
  failed: number
  deletedSource: number
}

const summary: Summary = {
  migrated: 0,
  skippedExisting: 0,
  skippedMissingAvatar: 0,
  dryRunPlanned: 0,
  failed: 0,
  deletedSource: 0,
}

try {
  console.log(`\n=== FireUX | Misebox Avatar Migration ===`)
  console.log(`Project: ${project.name} (${project.projectId})`)
  console.log(`Bucket: ${bucketName}`)
  console.log(`Source prefix: ${sourcePrefix}`)
  console.log(`Destination prefix: ${destinationPrefix}`)
  console.log(`Concurrency: ${concurrency}`)
  console.log(
    `Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}${
      deleteSource ? ' + DELETE SOURCE' : ''
    }`
  )

  const avatarTasks = await collectAvatarTasks(
    bucket,
    sourcePrefix,
    destinationPrefix
  )

  if (avatarTasks.length === 0) {
    console.log('\nNo avatar files found under source prefix. Nothing to do.')
    await deleteApp(app).catch(() => undefined)
    process.exit(0)
  }

  const uniqueUsers = new Set(avatarTasks.map((task) => task.uid))
  console.log(
    `\nDiscovered ${avatarTasks.length} avatar file(s) across ${uniqueUsers.size} user(s).`
  )

  await runWithConcurrency(avatarTasks, concurrency, async (task) => {
    await processTask(task)
  })

  console.log('\nSummary:')
  console.log(`  migrated:           ${summary.migrated}`)
  console.log(`  dry-run planned:    ${summary.dryRunPlanned}`)
  console.log(`  skipped (existing): ${summary.skippedExisting}`)
  console.log(`  skipped (missing):  ${summary.skippedMissingAvatar}`)
  if (deleteSource) {
    console.log(`  deleted source:     ${summary.deletedSource}`)
  }
  console.log(`  failed:             ${summary.failed}`)

  if (summary.failed > 0) {
    process.exitCode = 1
  }
} catch (error) {
  console.error('\nMigration failed:', error)
  process.exitCode = 1
} finally {
  await deleteApp(app).catch(() => undefined)
}

function normalizePrefix(input: string): string {
  const trimmed = input.replace(/^\/+/, '').replace(/\/+$/, '')
  return trimmed.length > 0 ? `${trimmed}/` : ''
}

async function collectAvatarTasks(
  bucket: ReturnType<typeof storage.bucket>,
  source: string,
  destination: string
) {
  const tasks: AvatarTask[] = []
  const [files] = await bucket.getFiles({ prefix: source, autoPaginate: true })

  const seenUsers = new Set<string>()

  for (const file of files) {
    const relative = file.name.slice(source.length)
    if (!relative) {
      continue
    }

    const segments = relative.split('/').filter(Boolean)
    if (segments.length < 2) {
      continue
    }

    const [uid, ...rest] = segments
    if (!uid || rest.length === 0) {
      continue
    }

    const fileName = rest.at(-1)
    if (!fileName) {
      continue
    }
    if (!fileName.toLowerCase().startsWith('avatar')) {
      if (!seenUsers.has(uid)) {
        seenUsers.add(uid)
      }
      continue
    }

    const destinationPath = `${destination}${uid}/${rest.join('/')}`
    tasks.push({ uid, sourcePath: file.name, destinationPath })
    seenUsers.add(uid)
  }

  summary.skippedMissingAvatar += [...seenUsers].filter(
    (uid) => !tasks.some((task) => task.uid === uid)
  ).length
  return tasks
}

async function processTask(task: AvatarTask) {
  const sourceFile = bucket.file(task.sourcePath)
  const destFile = bucket.file(task.destinationPath)

  const [destExists] = await destFile.exists()
  if (destExists) {
    summary.skippedExisting++
    console.log(`[skip] Destination exists: ${task.destinationPath}`)
    return
  }

  if (dryRun) {
    summary.dryRunPlanned++
    console.log(
      `[dry-run] Would copy ${task.sourcePath} -> ${task.destinationPath}`
    )
    return
  }

  let sourceMetadata
  try {
    ;[sourceMetadata] = await sourceFile.getMetadata()
  } catch (error) {
    summary.failed++
    console.error(
      `[error] Unable to load metadata for ${task.sourcePath}`,
      error
    )
    return
  }

  const metadataForDestination: Record<string, any> = {}
  if (sourceMetadata.cacheControl) {
    metadataForDestination.cacheControl = sourceMetadata.cacheControl
  }
  if (sourceMetadata.contentType) {
    metadataForDestination.contentType = sourceMetadata.contentType
  }
  if (sourceMetadata.contentDisposition) {
    metadataForDestination.contentDisposition =
      sourceMetadata.contentDisposition
  }
  const customMetadata = normalizeCustomMetadata(sourceMetadata.metadata)
  if (!customMetadata.firebaseStorageDownloadTokens) {
    const token = randomUUID()
    customMetadata.firebaseStorageDownloadTokens = token
    console.log(
      `[token] Generated new download token for ${task.destinationPath}`
    )
  }
  metadataForDestination.metadata = customMetadata

  try {
    await sourceFile.copy(destFile, { metadata: metadataForDestination as any })
    summary.migrated++
    console.log(
      `[migrate] Copied ${task.sourcePath} -> ${task.destinationPath}`
    )

    if (deleteSource) {
      await sourceFile.delete()
      summary.deletedSource++
      console.log(`[delete] Removed source ${task.sourcePath}`)
    }
  } catch (error) {
    summary.failed++
    console.error(
      `[error] Failed to copy ${task.sourcePath} -> ${task.destinationPath}`,
      error
    )
  }
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) {
  let index = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (index < items.length) {
        const currentIndex = index++
        const item = items[currentIndex]
        await worker(item)
      }
    }
  )
  await Promise.all(workers)
}

function normalizeCustomMetadata(
  input?: Record<string, unknown> | null
): Record<string, string> {
  if (!input) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (value == null) {
        return [key, '']
      }
      if (typeof value === 'string') {
        return [key, value]
      }
      if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      ) {
        return [key, String(value)]
      }
      if (typeof value === 'object') {
        return [key, JSON.stringify(value)]
      }
      return [key, JSON.stringify(value)]
    })
  )
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
    '\nUsage: pnpm tsx automation/maintenance/migrate-core-avatars.ts [options]'
  )
  console.log('\nOptions:')
  console.log(
    '  --project <key>        Target project (misebox, fireux, cleanbox). Default: misebox'
  )
  console.log(
    '  --bucket <name>        Override storage bucket. Default: <projectId>.appspot.com'
  )
  console.log(
    '  --source <prefix>      Source folder prefix. Default: core-users'
  )
  console.log(
    '  --dest <prefix>        Destination folder prefix. Default: users'
  )
  console.log('  --concurrency <n>      Parallel copy count. Default: 5')
  console.log(
    '  --dry-run              Log intended operations without copying'
  )
  console.log(
    '  --delete-source        Remove original avatar after successful copy'
  )
  console.log('  --help                 Show this message')
}
