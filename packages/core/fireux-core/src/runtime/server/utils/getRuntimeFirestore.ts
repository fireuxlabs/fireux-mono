import { useRuntimeConfig } from '#imports'
import { getFirestore } from 'firebase-admin/firestore'
import { observeRuntimeFirestore } from './firestore/live-read'
import { getAdminApp } from './getAdmin'

export function getRuntimeFirestore(databaseId?: string) {
  const runtime = useRuntimeConfig()
  const configuredDatabaseId = String(
    databaseId || runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

  return observeRuntimeFirestore(
    configuredDatabaseId
      ? getFirestore(getAdminApp(), configuredDatabaseId)
      : getFirestore(getAdminApp())
  )
}

export function getRuntimeIdentityFirestore(databaseId?: string) {
  const runtime = useRuntimeConfig()
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const configuredDatabaseId = String(
    databaseId || firebase?.identityDatabaseId || firebase?.databaseId || ''
  ).trim()

  return observeRuntimeFirestore(
    configuredDatabaseId
      ? getFirestore(getAdminApp(), configuredDatabaseId)
      : getFirestore(getAdminApp())
  )
}
