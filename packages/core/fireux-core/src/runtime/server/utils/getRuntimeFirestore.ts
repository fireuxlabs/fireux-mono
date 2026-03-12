import { useRuntimeConfig } from '#imports'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from './getAdmin'

export function getRuntimeFirestore(databaseId?: string) {
  const runtime = useRuntimeConfig()
  const configuredDatabaseId = String(
    databaseId || runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

  return configuredDatabaseId
    ? getFirestore(getAdminApp(), configuredDatabaseId)
    : getFirestore(getAdminApp())
}
