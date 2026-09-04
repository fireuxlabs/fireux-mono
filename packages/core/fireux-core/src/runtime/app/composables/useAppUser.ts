import { computed, unref, type MaybeRef } from 'vue'
import { useAppUserRead } from './useAppUserRead'
import { useAppUserCreate } from './useAppUserCreate'
import { useAppUserUpdate } from './useAppUserUpdate'
import { useAppUserDeletion } from './useAppUserDeletion'

/** App-owned relationship between one App and one global User. */
export function useAppUser(appId: MaybeRef<string>, userId: MaybeRef<string>) {
  const app = computed(() => String(unref(appId) || '').trim())
  const user = computed(() => String(unref(userId) || '').trim())
  const { appUser, pending, error } = useAppUserRead(app, user)
  const { createAppUser } = useAppUserCreate()
  const { updateAppUser } = useAppUserUpdate(app, user)
  const deletion = useAppUserDeletion(() => app.value, () => user.value)
  return {
    read: { data: appUser, pending, error },
    create: () => createAppUser(app.value, user.value),
    update: updateAppUser,
    deletion,
  }
}
