import { useRuntimeConfig } from '#imports'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { text } from './curation-input'

export async function curatorContext(event: H3Event) {
  const runtime = useRuntimeConfig(event)
  const appId = text(runtime.public?.fireux?.id)
  const role = text(runtime.public?.fireux?.role)
  const developerId = text(runtime.public?.fireux?.developerId)
  if (!isFirestoreDocumentId(appId) || role !== 'global') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ingredient curation belongs to the global App.',
    })
  }
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to curate Ingredients.'
  )
  return {
    appId,
    uid,
    isDeveloper: import.meta.dev && Boolean(developerId) && uid === developerId,
  }
}

export function assertCurator(membership: DocumentSnapshot, isDeveloper: boolean) {
  if (
    !isDeveloper &&
    (!membership.exists || text(membership.get('role')) !== 'admin')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Global App admin access is required to curate Ingredients.',
    })
  }
}
