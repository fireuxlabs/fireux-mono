import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { primeFirebaseEnv } from 'fireux-core/config/firebase-env'
import type { FirebaseProjectConfig } from 'fireux-core/config/firebase-project'
import { CLEANBOX_FIREBASE_PROJECT } from './firebase-project'

const DEFAULT_SERVICE_ACCOUNT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'config',
  'service-account.json'
)

export function primeCleanboxFirebaseEnv(
  overrides?: Partial<FirebaseProjectConfig>
): FirebaseProjectConfig {
  return primeFirebaseEnv(CLEANBOX_FIREBASE_PROJECT, {
    overrides,
    serviceAccountPath: DEFAULT_SERVICE_ACCOUNT_PATH,
  })
}
