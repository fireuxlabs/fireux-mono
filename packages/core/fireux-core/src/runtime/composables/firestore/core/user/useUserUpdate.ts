// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFirestoreUpdate } from '../../operations/useFirestoreUpdate.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import type { User } from './_useUser.ts'
/**
 * Simplified user updater for dashboard usage.
 * Always writes to the core user doc (users/{uid}) and stores avatars under users/{uid}/avatar.jpg.
 */
export function useUserUpdate(userRef?: Ref<User | null | undefined>) {
  const authRef = useCurrentUser()
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const getUid = () => userRef?.value?.id ?? authRef.value?.uid
  const requireUid = () => {
    const uid = getUid()
    if (!uid) {
      throw new Error('[useUserUpdate] Missing uid (probably not signed in)')
    }
    return uid
  }

  const updateFields = async (partial: Record<string, unknown>) => {
    const uid = requireUid()
    await updateDocument('users', uid, partial)
  }

  const updateDisplayName = (display_name: string) =>
    updateFields({ display_name })

  const updateHandle = (handle: string) => updateFields({ handle })

  const updateEmail = (email: string) => updateFields({ email })

  const updateBio = (bio: string) => updateFields({ bio })

  const updateAvatar = async (source: Blob | string) => {
    const uid = requireUid()
    const path = `users/${uid}/avatar.jpg`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url })
    return url
  }

  return {
    updateFields,
    updateDisplayName,
    updateHandle,
    updateEmail,
    updateBio,
    updateAvatar,
  }
}
