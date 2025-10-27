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
import { getFirestore } from 'firebase-admin/firestore'

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
const project = PROJECTS[projectKey]

if (!project) {
  console.error(
    `Unknown project "${projectKey}". Available: ${Object.keys(PROJECTS).join(
      ', '
    )}`
  )
  process.exit(1)
}

const limitInput = readFlagValue('--limit')
const limit = limitInput ? Number.parseInt(limitInput, 10) : undefined

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `list-user-avatars-firestore-${project.projectId}-${Date.now()}`
)

try {
  const db = getFirestore(app)
  let query = db.collection('users').orderBy('display_name')
  if (limit && Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit)
  }
  const snapshot = await query.get()

  const result = snapshot.docs.map((doc) => ({
    id: doc.id,
    avatar: doc.get('avatar') ?? null,
  }))
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
} catch (error) {
  console.error('Failed to list Firestore avatars', error)
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
