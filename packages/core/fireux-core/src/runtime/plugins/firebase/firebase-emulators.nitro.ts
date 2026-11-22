import { useRuntimeConfig } from '#imports'

/** Admin SDK reads these directly, independently of VueFire's client options. */
export default function verifyFirebaseEmulatorEnvironment() {
  const emulators = useRuntimeConfig().public.vuefire?.emulators
  const allowed =
    import.meta.dev &&
    process.env.NODE_ENV !== 'production' &&
    process.env.VUEFIRE_EMULATORS === 'true'
  if (emulators?.firestore && !allowed) {
    throw new Error(
      '[fireux-core/firebase] Firestore emulator routing requires explicit development opt-in.'
    )
  }

  for (const [service, key] of [
    ['firestore', 'FIRESTORE_EMULATOR_HOST'],
    ['auth', 'FIREBASE_AUTH_EMULATOR_HOST'],
    ['storage', 'FIREBASE_STORAGE_EMULATOR_HOST'],
  ] as const) {
    const emulator = allowed ? emulators?.[service] : undefined
    const expected = emulator ? `${emulator.host}:${emulator.port}` : undefined
    if ((process.env[key] || undefined) !== expected) {
      throw new Error(
        `[fireux-core/firebase] ${key} must match VueFire's explicit development emulator configuration.`
      )
    }
  }
}
