import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import { provisionSignedInUserAvatar } from '../../composables/fireux/firebase/userAvatarProvisioning'
import type { User } from '../models/user.model'
import type { Ref } from 'vue'
import { useUserHandleUpdate } from './firestore/mutations/useUserHandleUpdate'
import {
  readUserProfileChanges,
  type UserProfileChanges,
} from '../utils/profile-validation'

/** Profile workflow including server validation, handle ownership, and media. */
export function useUserProfileUpdate({
  user,
}: {
  user: Ref<User | null | undefined>
}) {
  const { updateHandle } = useUserHandleUpdate()

  const getUserId = () => {
    if (!user.value?.id) throw new Error('User is not ready.')
    return user.value.id
  }

  const update = async (change: UserProfileChanges) => {
    const signedInUser = await useRequireUser()
    if (signedInUser.uid !== getUserId()) {
      throw new Error('You can only update your own profile.')
    }
    const token = await signedInUser.getIdToken()
    await $fetch('/api/internal/user/profile', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body: readUserProfileChanges(change),
    })
  }

  const name = async (displayName: string) => {
    await update({ display_name: displayName })
  }

  const bio = async (bio: string) => {
    await update({ bio })
  }

  const avatar = async (source: File | Blob) => {
    return provisionSignedInUserAvatar(getUserId(), source)
  }

  const handle = async (handle: string) => {
    await updateHandle(getUserId(), handle)
  }

  return {
    update,
    name,
    bio,
    avatar,
    handle,
  }
}
