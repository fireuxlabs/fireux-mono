import type { FirebaseProjectConfig } from '../schemas/firebase-project'

function setIfMissing(key: string, value?: string) {
  if (typeof value !== 'string' || !value.trim()) return
  if (!process.env[key]) process.env[key] = value.trim()
}

export function primeFirebaseEnv(
  project: FirebaseProjectConfig,
  options: {
    overrides?: Partial<FirebaseProjectConfig>
    serviceAccountPath?: string
  } = {}
): FirebaseProjectConfig {
  const merged: FirebaseProjectConfig = {
    ...project,
    ...(options.overrides || {}),
  }

  setIfMissing('NUXT_FIREBASE_API_KEY', merged.apiKey)
  setIfMissing('NUXT_FIREBASE_AUTH_DOMAIN', merged.authDomain)
  setIfMissing('NUXT_FIREBASE_PROJECT_ID', merged.projectId)
  setIfMissing('NUXT_FIREBASE_STORAGE_BUCKET', merged.storageBucket)
  setIfMissing('NUXT_FIREBASE_MESSAGING_SENDER_ID', merged.messagingSenderId)

  // Optional: used by server-side admin initialization helpers.
  if (
    typeof options.serviceAccountPath === 'string' &&
    options.serviceAccountPath.trim() &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ) {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = options.serviceAccountPath.trim()
  }

  return merged
}
