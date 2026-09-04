import { getFirestore } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { unref, type Ref } from 'vue'
import { useFirebaseApp } from 'vuefire'

export * from 'vuefire'

type DatabaseIdInput =
  | string
  | Ref<string | null | undefined>
  | null
  | undefined

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

export function readRuntimeSimulationFirestoreDatabaseId() {
  const runtime = useRuntimeConfig()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.simulationDatabaseId || ''
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
  return () => {
    const resolvedDatabaseId = resolveDatabaseId(databaseId)
    return resolvedDatabaseId
      ? getFirestore(app, resolvedDatabaseId)
      : getFirestore(app)
  }
}
