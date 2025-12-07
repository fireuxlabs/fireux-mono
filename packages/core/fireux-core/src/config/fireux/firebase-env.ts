import { existsSync } from 'node:fs'
import { resolve as pathResolve } from 'node:path'
import type { FirebaseProjectConfig } from '../schemas/firebase-project'
import { getFirebaseProjectConfig } from './firebase-projects'
import { resolveWorkspaceRoot } from './env'

const BASE_ENV_MAP: Record<string, keyof FirebaseProjectConfig> = {
  FIREBASE_API_KEY: 'apiKey',
  FIREBASE_AUTH_DOMAIN: 'authDomain',
  FIREBASE_PROJECT_ID: 'projectId',
  FIREBASE_STORAGE_BUCKET: 'storageBucket',
  FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
  FIREBASE_APP_ID: 'appId',
  FIREBASE_MEASUREMENT_ID: 'measurementId',
  FIREBASE_REGISTRY_DATABASE_ID: 'registryDatabaseId',
}

const DEFAULT_RUNTIME_PREFIXES = ['NUXT_FIREBASE', 'NUXT_PUBLIC_FIREBASE']

function setEnvIfMissing(key: string, value?: string) {
  if (!value) return
  if (process.env[key] && process.env[key]!.length > 0) return
  process.env[key] = value
}

function applyEnvMappings(
  project: FirebaseProjectConfig,
  runtimePrefixes: string[]
) {
  for (const [envKey, projectKey] of Object.entries(BASE_ENV_MAP)) {
    setEnvIfMissing(envKey, project[projectKey])
  }

  for (const prefix of runtimePrefixes) {
    for (const envKey of Object.keys(BASE_ENV_MAP) as Array<
      keyof typeof BASE_ENV_MAP
    >) {
      const nextKey = envKey.replace('FIREBASE', prefix)
      const projectKey = BASE_ENV_MAP[envKey]
      setEnvIfMissing(nextKey, project[projectKey])
    }
  }
}

export interface PrimeFirebaseEnvOptions {
  overrides?: Partial<FirebaseProjectConfig>
  runtimePrefixes?: string[]
  serviceAccountPath?: string
}

export function primeFirebaseEnv(
  baseProject: FirebaseProjectConfig,
  options?: PrimeFirebaseEnvOptions
): FirebaseProjectConfig {
  const project = {
    ...baseProject,
    ...(options?.overrides ?? {}),
  }

  applyEnvMappings(
    project,
    options?.runtimePrefixes ?? DEFAULT_RUNTIME_PREFIXES
  )

  if (
    options?.serviceAccountPath &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = options.serviceAccountPath
  }

  return project
}

export function primeEcosystemFirebaseEnv(
  ecosystem: string
): FirebaseProjectConfig | undefined {
  const project = getFirebaseProjectConfig(ecosystem)
  if (!project) return undefined

  const workspaceRoot = resolveWorkspaceRoot()
  const candidate = pathResolve(
    workspaceRoot,
    'packages/ecosystem',
    `fireux-${ecosystem}`,
    'config',
    'service-account.json'
  )
  const serviceAccountPath = existsSync(candidate) ? candidate : undefined

  return primeFirebaseEnv(project, { serviceAccountPath })
}
