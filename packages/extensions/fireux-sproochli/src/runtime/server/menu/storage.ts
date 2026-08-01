import { useRuntimeConfig } from '#imports'
import type { Firestore } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  SPROOCHLI_HOST_DATABASE_ID,
  type SproochliHostTarget,
} from '../../host'

export type SproochliHostStorage = {
  target: SproochliHostTarget
  db: Firestore
}

const text = (value: unknown) => String(value ?? '').trim()

export function resolveSproochliHostStorage(): SproochliHostStorage {
  const runtime = useRuntimeConfig()
  const appId = text(runtime.public?.fireux?.id)
  const firebaseProjectId = text(
    runtime.public?.firebaseEcosystem?.firebase?.projectId
  )
  if (!appId || !firebaseProjectId) {
    throw new Error('Sproochli host Firebase authority is unavailable.')
  }

  return {
    target: {
      appId,
      firebaseProjectId,
      databaseId: SPROOCHLI_HOST_DATABASE_ID,
    },
    db: getRuntimeFirestore(SPROOCHLI_HOST_DATABASE_ID),
  }
}

export function sproochliStorageMetadata(target: SproochliHostTarget) {
  return {
    host_app_id: text(target.appId),
    firebase_project_id: text(target.firebaseProjectId),
    database_id: target.databaseId,
  }
}

export function matchesSproochliStorageMetadata(
  value: unknown,
  target: SproochliHostTarget
) {
  const data =
    value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
  const expected = sproochliStorageMetadata(target)
  const hostAppId = text(data.host_app_id)

  return (
    Boolean(hostAppId) &&
    text(data.firebase_project_id) === expected.firebase_project_id &&
    text(data.database_id) === expected.database_id
  )
}
