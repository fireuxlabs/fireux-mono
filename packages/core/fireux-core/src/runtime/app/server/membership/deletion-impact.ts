import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import type { AppUserDeletionImpact } from '../../models/app-user-deletion'

/** Deterministic impact read. The matching transaction repeats the final-owner check. */
export async function readAppUserDeletionImpact(
  event: H3Event,
  requestedUserId: string
): Promise<AppUserDeletionImpact> {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig()
  const userId = requireFirestoreDocumentId(requestedUserId, 'User id')
  const app = getRuntimeFirestore().collection('apps').doc(appId)
  const [actor, target, administrators] = await Promise.all([
    app.collection('users').doc(uid).get(),
    app.collection('users').doc(userId).get(),
    app.collection('users').where('role', '==', 'admin').get(),
  ])
  const actorRole = actor.data()?.role
  if (uid !== userId && actorRole !== 'admin' && actorRole !== 'dev') {
    throw createError({ statusCode: 403, statusMessage: 'App administrator access is required.' })
  }
  const role = typeof target.data()?.role === 'string' ? target.data()?.role : null
  const blockers = target.exists && role === 'admin' && administrators.size <= 1
    ? ['The final App administrator cannot be removed.']
    : []
  return {
    appId,
    userId,
    exists: target.exists,
    role,
    administratorCount: administrators.size,
    canDelete: target.exists && blockers.length === 0,
    blockers,
  }
}
