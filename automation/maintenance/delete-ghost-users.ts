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
import type { DocumentData } from 'firebase-admin/firestore'

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

const shouldDelete = argv.includes('--yes') || argv.includes('--delete')
const silent = argv.includes('--quiet') || argv.includes('--silent')

const credential = loadCredential(project)
const app = initializeApp(
  { credential, projectId: project.projectId },
  `delete-ghost-users-${project.projectId}-${Date.now()}`
)

try {
  const db = getFirestore(app)
  const snapshot = await db.collection('users').get()

  const ghosts = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))
    .filter(({ data }) => isGhostUser(data))

  if (!ghosts.length) {
    if (!silent) {
      console.log('[delete-ghost-users] no ghost users found.')
    }
    process.exit(0)
  }

  if (!silent) {
    console.log(
      `[delete-ghost-users] identified ${ghosts.length} ghost user${
        ghosts.length === 1 ? '' : 's'
      }:`
    )
    console.log(
      JSON.stringify(
        ghosts.map(({ id, data }) => ({ id, avatar: data.avatar ?? null })),
        null,
        2
      )
    )
  }

  if (!shouldDelete) {
    if (!silent) {
      console.log(
        '[delete-ghost-users] dry run. Re-run with --yes to delete these documents.'
      )
    }
    process.exit(0)
  }

  let deleted = 0
  for (const ghost of ghosts) {
    await db.collection('users').doc(ghost.id).delete()
    deleted += 1
    if (!silent) {
      console.log(`[delete-ghost-users] deleted users/${ghost.id}`)
    }
  }

  if (!silent) {
    console.log(`[delete-ghost-users] completed. Deleted ${deleted} documents.`)
  }
} catch (error) {
  console.error('[delete-ghost-users] failed', error)
  process.exitCode = 1
} finally {
  await deleteApp(app).catch(() => undefined)
}

function isGhostUser(data: DocumentData): boolean {
  const keys = Object.keys(data)
  if (!keys.length) return true
  if (keys.length === 1 && keys[0] === 'avatar') {
    return true
  }
  return false
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
    console.error('[delete-ghost-users] failed to load Firebase credentials.')
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
