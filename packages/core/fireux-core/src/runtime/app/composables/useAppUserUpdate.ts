import { unref, type MaybeRef } from 'vue'
import { useFirestoreUpdate } from '../../composables/fireux/firestore/operations/useFirestoreUpdate'
import type { AppUser } from '../models/app-user.model'

/** Update one AppUser relationship; neither root entity is changed. */
export function useAppUserUpdate(appId: MaybeRef<string>, userId: MaybeRef<string>) {
  const { updateDocument } = useFirestoreUpdate()
  async function updateAppUser(changes: Partial<Omit<AppUser, 'created' | 'updated'>>) {
    const app = String(unref(appId) || '').trim()
    const user = String(unref(userId) || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    await updateDocument<AppUser>(`apps/${app}/users`, user, changes)
  }
  return { updateAppUser }
}
