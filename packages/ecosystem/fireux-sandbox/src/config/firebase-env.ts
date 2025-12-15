import { primeFirebaseEnv } from 'fireux-core/config/fireux/firebase-env'
import type { FirebaseProjectConfig } from 'fireux-core/config/schemas/firebase-project'
import { SANDBOX_FIREBASE_PROJECT } from './firebase-project'

export function primeSandboxFirebaseEnv(
  overrides?: Partial<FirebaseProjectConfig>
): FirebaseProjectConfig {
  return primeFirebaseEnv(SANDBOX_FIREBASE_PROJECT, { overrides })
}
