import { arrayRemove, arrayUnion } from 'firebase/firestore'
import type {
  User,
  UserNotification,
} from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import { useImageStorage } from '../../../../../firebase/useImageStorage'
import { useUserFormattingAndValidation } from '../validation/useUserFormatting'
import { createUserNotification } from '../ensureHelpers'

type CoreProfileActions = {
  rename: (displayName: string) => Promise<void>
  setAvatarUrl: (url: string | null) => Promise<void>
  uploadAvatar: (source: File | Blob) => Promise<string>
  setBio: (bio: string) => Promise<void>
}

type CoreTagActions = {
  add: (tagId: string) => Promise<void>
  remove: (tagId: string) => Promise<void>
}

type CoreNotificationActions = {
  push: (message: string) => Promise<UserNotification>
}

export function useCoreUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl, Bio } = useUserFormattingAndValidation()

  const core = user.coreUser as { value: User | undefined }

  const requireCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useCoreUserUpdate] Missing core user id')
    return id
  }

  const profile: CoreProfileActions = {
    rename: async (displayName) => {
      const id = requireCoreId()
      const formatted = DisplayName.format(displayName)
      const validation = DisplayName.validate(formatted)
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid display name')
      }
      await updateDocument<User>('users', id, { display_name: formatted })
    },
    setAvatarUrl: async (value) => {
      const id = requireCoreId()
      const formatted = AvatarUrl.format(value ?? '')
      const validation = AvatarUrl.validate(formatted)
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid avatar URL')
      }
      await updateDocument<User>('users', id, { avatar: formatted || '' })
    },
    uploadAvatar: async (source) => {
      const id = requireCoreId()
      const token =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)
      const path = `users/${id}/avatar/${token}`
      const url = await uploadImage(path, source)
      await updateDocument<User>('users', id, { avatar: url })
      return url
    },
    setBio: async (value) => {
      const id = requireCoreId()
      const formatted = Bio.format(value ?? '')
      const validation = Bio.validate(formatted)
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid bio')
      }
      await updateDocument<User>('users', id, { bio: formatted || '' })
    },
  }

  const normalizeTagId = (value: string) => {
    const trimmed = (value ?? '').trim()
    return trimmed || null
  }

  const tags: CoreTagActions = {
    add: async (tagId) => {
      const normalized = normalizeTagId(tagId)
      if (!normalized) return
      const id = requireCoreId()
      await updateDocument<User>('users', id, {
        profiles: arrayUnion(normalized) as unknown as string[],
      })
    },
    remove: async (tagId) => {
      const normalized = normalizeTagId(tagId)
      if (!normalized) return
      const id = requireCoreId()
      await updateDocument<User>('users', id, {
        profiles: arrayRemove(normalized) as unknown as string[],
      })
    },
  }

  const notifications: CoreNotificationActions = {
    push: async (message) => {
      const id = requireCoreId()
      const notification = createUserNotification({
        message,
        scope: 'ecosystem',
      })
      await updateDocument<User>('users', id, {
        notifications: arrayUnion(
          notification
        ) as unknown as UserNotification[],
      })
      return notification
    },
  }

  return {
    profile,
    tags,
    notifications,
  }
}
