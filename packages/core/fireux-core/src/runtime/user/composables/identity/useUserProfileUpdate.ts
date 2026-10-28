import { refreshNuxtData } from 'nuxt/app'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
import { provisionSignedInUserAvatar } from '../../utils/provision-user-avatar'
import type { User } from '../../models/user.model'
import type { Ref } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { updateUserHandle } from '../../utils/update-user-handle'
import {
  readUserProfileChanges,
  type UserProfileChanges,
} from '../../utils/profile-validation'

/** Profile workflow including server validation, handle ownership, and media. */
export function useUserProfileUpdate({
  user,
}: {
  user: Ref<User | null | undefined>
}) {
  const { currentUser } = useAuth()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    () => user.value?.id,
  ])

  const getUserId = () => {
    if (!user.value?.id) throw new Error('User is not ready.')
    return user.value.id
  }

  const update = async (change: UserProfileChanges) => {
    const userId = getUserId()
    const body = readUserProfileChanges(change)
    const isCurrent = capture()
    const assertCurrent = () => {
      if (!isCurrent() || currentUser.value?.uid !== userId)
        throw new Error(
          'The User or account context changed. Please try again.'
        )
    }
    const signedInUser = await useRequireUser()
    assertCurrent()
    if (signedInUser.uid !== userId) {
      throw new Error('You can only update your own profile.')
    }
    const token = await signedInUser.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: true; uid: string }>(
      '/api/internal/user/profile',
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body,
      }
    )
    if (result?.ok !== true || result.uid !== userId)
      throw new Error('User profile response was invalid.')
  }

  const name = async (displayName: string) => {
    await update({ display_name: displayName })
  }

  const bio = async (bio: string) => {
    await update({ bio })
  }

  const avatar = async (source: File | Blob) => {
    return provisionSignedInUserAvatar(getUserId(), source, capture())
  }

  const handle = async (handle: string) => {
    await updateUserHandle(getUserId(), handle, undefined, capture())
  }

  return {
    update,
    name,
    bio,
    avatar,
    handle,
  }
}
