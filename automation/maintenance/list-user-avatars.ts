#!/usr/bin/env tsx

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
import { getStorage } from 'firebase-admin/storage'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

interface ProjectConfig {
  key: string
  projectId: string
  serviceAccountPath: string
}

const PROJECTS: Record<string, ProjectConfig> = {
  misebox: {
    key: 'misebox',
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

const projectKey = readFlagValue('--project') ?? 'misebox'
const prefix = readFlagValue('--prefix') ?? 'users'
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

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `list-avatars-${project.projectId}-${Date.now()}`
)

async function main() {
  const storage = getStorage(app)
  const bucket = storage.bucket(bucketName)
  const [files] = await bucket.getFiles({
    prefix: `${normalizePrefix(prefix)}`,
    autoPaginate: true,
  })

  const avatarFiles = files.filter((file) => {
    const name = file.name.split('/').pop()?.toLowerCase() ?? ''
    return name.startsWith('avatar')
  })

  avatarFiles.sort((a, b) => a.name.localeCompare(b.name))

  const result: Record<string, string> = {}

  for (const file of avatarFiles) {
    const parts = file.name.split('/').filter(Boolean)
    const uid = parts.length >= 2 ? parts[1] ?? parts[0] : parts[0]
    if (!uid) {
      continue
    }

    const [metadata] = await file.getMetadata()
    const token = metadata.metadata?.firebaseStorageDownloadTokens
    if (!token) {
      continue
    }

    const encodedPath = encodeURIComponent(file.name)
    result[
      uid
    ] = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

try {
  await main()
} catch (error) {
  console.error('Failed to list avatars', error)
  process.exitCode = 1
} finally {
  await deleteApp(app).catch(() => undefined)
}

function normalizePrefix(input: string) {
  let trimmed = input
  while (trimmed.startsWith('/')) {
    trimmed = trimmed.slice(1)
  }
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1)
  }
  return trimmed ? `${trimmed}/` : ''
}

function loadCredential(projectConfig: ProjectConfig) {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const fileEnv = process.env.FIREBASE_SERVICE_ACCOUNT_FILE

  try {
    if (inlineJson) {
      return cert(JSON.parse(inlineJson) as ServiceAccount)
    }

    if (fileEnv && fs.existsSync(fileEnv)) {
      return cert(
        JSON.parse(fs.readFileSync(fileEnv, 'utf8')) as ServiceAccount
      )
    }

    if (fs.existsSync(projectConfig.serviceAccountPath)) {
      return cert(
        JSON.parse(
          fs.readFileSync(projectConfig.serviceAccountPath, 'utf8')
        ) as ServiceAccount
      )
    }

    return applicationDefault()
  } catch (error) {
    console.error('Failed to load Firebase credentials.')
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
