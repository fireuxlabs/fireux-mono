import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { AppUser } from '../models/app-user.model'

export type AppUserCreateInput = Partial<
  Omit<AppUser, 'created' | 'updated'>
>

/** Create exactly one AppUser relationship document. */
export function useAppUserCreate() {
  const { createDocument } = useFirestoreCreate()

  async function createAppUser(
    appId: string,
    userId: string,
    input: AppUserCreateInput = {}
  ) {
    const app = String(appId || '').trim()
    const user = String(userId || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    return await createDocument(
      `apps/${app}/users`,
      {
        role: 'user',
        subscription: 'free',
        onboarding_status: 'pending',
        ...input,
      },
      { id: user }
    )
  }
  return { createAppUser }
}
