import type { FirebaseApp } from 'firebase/app'
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { unref, type Ref } from 'vue'
import { useFirebaseApp } from 'vuefire'

export * from 'vuefire'

type DatabaseIdInput =
  | string
  | Ref<string | null | undefined>
  | null
  | undefined

const connectedEmulators = new WeakSet<Firestore>()

export function getAppFirestore(
  app: FirebaseApp,
  databaseId: string,
  emulator?: { host: string; port: number }
) {
  if (!databaseId || databaseId === '(default)') return getFirestore(app)

  const database = getFirestore(app, databaseId)
  // VueFire connects the default instance. Named instances have independent settings.
  if (import.meta.dev && emulator && !connectedEmulators.has(database)) {
    connectFirestoreEmulator(database, emulator.host, emulator.port)
    connectedEmulators.add(database)
  }
  return database
}

export function readRuntimeFirestoreDatabaseId() {
  const runtime = useRuntimeConfig()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  return databaseId || undefined
}

export function readRuntimeIdentityFirestoreDatabaseId() {
  const runtime = useRuntimeConfig()
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const databaseId = String(
    firebase?.identityDatabaseId || firebase?.databaseId || ''
  ).trim()
  return databaseId || undefined
}

const resolveDatabaseId = (databaseId?: DatabaseIdInput) =>
  String(unref(databaseId) || readRuntimeFirestoreDatabaseId() || '').trim() ||
  undefined

export function useFirestore(databaseId?: DatabaseIdInput) {
  return useFirestoreResolver(databaseId)()
}

export function useFirestoreResolver(databaseId?: DatabaseIdInput) {
  const app = useFirebaseApp()
  const emulator = useRuntimeConfig().public.vuefire?.emulators?.firestore
  return () => {
    const resolvedDatabaseId = resolveDatabaseId(databaseId)
    return getAppFirestore(app, resolvedDatabaseId || '', emulator)
  }
}
