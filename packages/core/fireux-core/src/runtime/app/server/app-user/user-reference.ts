import { FieldValue } from 'firebase-admin/firestore'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'

/**
 * Reconcile one cross-database locator from canonical AppUser truth.
 * Safe to retry after either the App transaction or identity write succeeds.
 */
export async function reconcileUserAppReference(input: {
  appId: string
  userId: string
  appDatabaseId: string
  identityDatabaseId: string
}) {
  const membership = await getRuntimeFirestore(input.appDatabaseId)
    .collection('apps')
    .doc(input.appId)
    .collection('users')
    .doc(input.userId)
    .get()
  const reference = getRuntimeIdentityFirestore(input.identityDatabaseId)
    .collection('users')
    .doc(input.userId)
    .collection('apps')
    .doc(input.appId)

  if (!membership.exists) {
    await reference.delete()
    return { exists: false }
  }

  const previous = await reference.get()
  const now = FieldValue.serverTimestamp()
  await reference.set(
    {
      app_id: input.appId,
      database_id: input.appDatabaseId,
      created: previous.exists ? previous.data()?.created ?? { at: now } : { at: now },
      updated: { at: now },
    },
    { merge: false }
  )
  return { exists: true }
}
