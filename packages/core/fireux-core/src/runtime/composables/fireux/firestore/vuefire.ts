import { getFirestore } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFirebaseApp } from 'vuefire'

export * from 'vuefire'

function readRuntimeFirestoreDatabaseId() {
  const runtime = useRuntimeConfig()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  return databaseId || undefined
}

export function useFirestore() {
  const app = useFirebaseApp()
  const databaseId = readRuntimeFirestoreDatabaseId()
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app)
}
