import { computed, unref, type MaybeRef } from 'vue'
import { useAppUserRead } from './useAppUserRead'
import { useAppUserCreate } from './useAppUserCreate'
import { useAppUserUpdate } from './useAppUserUpdate'
import { useAppUserDelete } from './useAppUserDelete'

/** App-owned relationship between one App and one global User. */
export function useAppUser(appId: MaybeRef<string>, userId: MaybeRef<string>) {
  const app = computed(() => String(unref(appId) || '').trim())
  const user = computed(() => String(unref(userId) || '').trim())
  const { appUser, pending, error } = useAppUserRead(app, user)
  const { createAppUser } = useAppUserCreate()
  const { updateAppUser } = useAppUserUpdate(app, user)
  const { deleteAppUser } = useAppUserDelete()
  return {
    appUser,
    pending,
    error,
    create: (input: Parameters<typeof createAppUser>[2]) => createAppUser(app.value, user.value, input),
    update: updateAppUser,
    delete: () => deleteAppUser(app.value, user.value),
  }
}
