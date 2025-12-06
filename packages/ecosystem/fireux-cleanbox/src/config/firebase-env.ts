import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CLEANBOX_FIREBASE_PROJECT,
  type CleanboxFirebaseProject,
} from './firebase-project'

const BASE_ENV_MAP: Record<string, keyof CleanboxFirebaseProject> = {
  FIREBASE_API_KEY: 'apiKey',
  FIREBASE_AUTH_DOMAIN: 'authDomain',
  FIREBASE_PROJECT_ID: 'projectId',
  FIREBASE_STORAGE_BUCKET: 'storageBucket',
  FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
  FIREBASE_APP_ID: 'appId',
  FIREBASE_MEASUREMENT_ID: 'measurementId',
}

const RUNTIME_ENV_PREFIXES = ['NUXT_FIREBASE', 'NUXT_PUBLIC_FIREBASE']
const TENANT_OVERRIDES: Record<string, Partial<CleanboxFirebaseProject>> = {
  'richies-reinigung': {
    appId: '1:1083929507377:web:0f402d2a05f6517c658710',
    measurementId: 'G-M5R76FLJ8T',
  },
}

const DEFAULT_SERVICE_ACCOUNT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'config',
  'service-account.json'
)

function setEnv(key: string, value?: string) {
  if (!value) return
  if (process.env[key] && process.env[key]!.length > 0) return
  process.env[key] = value
}

function applyEnvMappings(project: CleanboxFirebaseProject) {
  for (const [envKey, projectKey] of Object.entries(BASE_ENV_MAP)) {
    setEnv(envKey, project[projectKey])
  }

  for (const prefix of RUNTIME_ENV_PREFIXES) {
    for (const [envKey, projectKey] of Object.entries(BASE_ENV_MAP)) {
      const nextKey = envKey.replace('FIREBASE', prefix)
      setEnv(nextKey, project[projectKey])
    }
  }
}

export function primeCleanboxFirebaseEnv(
  overrides?: Partial<CleanboxFirebaseProject>
): CleanboxFirebaseProject {
  const tenantId =
    process.env.APP_ID ??
    process.env.NUXT_APP_ID ??
    process.env.NUXT_PUBLIC_APP_ID
  const tenantOverrides = tenantId ? TENANT_OVERRIDES[tenantId] : undefined

  const project = {
    ...CLEANBOX_FIREBASE_PROJECT,
    ...(tenantOverrides ?? {}),
    ...(overrides ?? {}),
  }

  applyEnvMappings(project)
  setEnv('FIREBASE_REGISTRY_DATABASE_ID', project.registryDatabaseId)
  setEnv('NUXT_FIREBASE_REGISTRY_DATABASE_ID', project.registryDatabaseId)
  setEnv(
    'NUXT_PUBLIC_FIREBASE_REGISTRY_DATABASE_ID',
    project.registryDatabaseId
  )

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = DEFAULT_SERVICE_ACCOUNT_PATH
  }

  return project
}
