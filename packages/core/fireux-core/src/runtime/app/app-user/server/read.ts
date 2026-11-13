import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import type { AppUserWithId } from '../types'

export async function readAppUser(
  appId: string,
  userId: string
): Promise<AppUserWithId | null> {
  const snapshot = await getRuntimeFirestore()
    .collection('apps')
    .doc(appId)
    .collection('users')
    .doc(userId)
    .get()
  return snapshot.exists
    ? ({ id: snapshot.id, ...snapshot.data() } as AppUserWithId)
    : null
}
