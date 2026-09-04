import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { AppUser } from '../models/app-user.model'

/** Create one AppUser relationship; neither root entity is created. */
export function useAppUserCreate() {
  const { createDocument } = useFirestoreCreate()
  async function createAppUser(appId: string, userId: string, input: Omit<AppUser, 'created' | 'updated'>) {
    const app = String(appId || '').trim()
    const user = String(userId || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    return await createDocument(`apps/${app}/users`, input, { id: user, creator: true })
  }
  return { createAppUser }
}
