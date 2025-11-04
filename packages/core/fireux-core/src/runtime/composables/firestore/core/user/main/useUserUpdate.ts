import { computed, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type UpdatePayload = Partial<User> & Record<string, unknown>

type UserSource = Ref<User | null | undefined> | UserRefs | undefined

export function useUserUpdate(user?: UserSource) {
  const { uid } = useAuth()
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const targetId = computed(() => {
    if (!user) return uid.value ?? null
    if ('coreUser' in (user as UserRefs)) {
      const grouped = user as UserRefs
      return grouped.coreUser.value?.id ?? uid.value ?? null
    }
    const refUser = user as Ref<User | null | undefined>
    return refUser.value?.id ?? uid.value ?? null
  })

  const requireUid = () => {
    const value = targetId.value
    if (!value) throw new Error('[useUserUpdate] Missing uid (not signed in)')
    return value
  }

  const updateUser = async (partial: UpdatePayload) => {
    const id = requireUid()
    await updateDocument<User>('users', id, partial)
  }

  const updateDisplayName = (display_name: string) =>
    updateUser({ display_name })

  const updateHandle = (handle: string) => updateUser({ handle })

  const updateEmail = (email: string) => updateUser({ email })

  const updateBio = (bio: string) => updateUser({ bio })

  const updateAvatar = async (source: Blob | string) => {
    const id = requireUid()
    const path = `users/${id}/avatar.jpg`
    const url = await uploadImage(path, source)
    await updateUser({ avatar: url })
    return url
  }

  const updateFields = (partial: Record<string, unknown>) =>
    updateUser(partial as UpdatePayload)

  return {
    targetId,
    updateFields,
    updateUser,
    updateDisplayName,
    updateHandle,
    updateEmail,
    updateBio,
    updateAvatar,
  }
}
