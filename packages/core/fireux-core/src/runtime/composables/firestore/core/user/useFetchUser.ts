import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Fetch a single core user document by id.
 * Reactive via VueFire. No extra logic.
 */
export function useFetchUser(userId?: string) {
  const db = useFirestore()
  if (!userId) throw new Error('useFetchUser: no userId provided')

  const ref = doc(db, 'users', userId)
  const { data: user } = useDocument<User>(ref as any)

  return { user }
}