import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import { useImageStorage } from '../../composables/fireux/firebase/useImageStorage'
import type { User } from '../models/user.model'
import type { Ref } from 'vue'
import { useUserHandleUpdate } from './firestore/mutations/useUserHandleUpdate'

function avatarExtension(source: File | Blob): string {
  const name =
    typeof File !== 'undefined' && source instanceof File ? source.name : ''
  const fromName = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
  if (fromName === 'jpg' || fromName === 'jpeg') return 'jpg'
  if (fromName === 'png' || fromName === 'webp' || fromName === 'gif') {
    return fromName
  }

  const mime = source.type.toLowerCase()
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

/** Profile workflow including server validation, handle ownership, and media. */
export function useUserProfileUpdate({ user }: { user: Ref<User | null | undefined> }) {
  const { updateHandle } = useUserHandleUpdate()

  const getUserId = () => {
    if (!user.value?.id) throw new Error('User is not ready.')
    return user.value.id
  }

  const update = async (
    change: Partial<Pick<User, 'display_name' | 'bio' | 'avatar'>>
  ) => {
    const signedInUser = await useRequireUser()
    if (signedInUser.uid !== getUserId()) {
      throw new Error('You can only update your own profile.')
    }
    const token = await signedInUser.getIdToken()
    await $fetch('/api/internal/user/profile', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body: change,
    })
  }

  const name = async (displayName: string) => {
    await update({ display_name: displayName })
  }

  const bio = async (bio: string) => {
    await update({ bio })
  }

  const avatar = async (source: File | Blob) => {
    const path = `users/${getUserId()}/avatar/${Date.now()}.${avatarExtension(source)}`
    const { uploadImage } = useImageStorage()
    const url = await uploadImage(path, source)
    await update({ avatar: url })
    return url
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
