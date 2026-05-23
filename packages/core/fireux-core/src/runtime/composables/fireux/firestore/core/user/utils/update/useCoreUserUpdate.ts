import { addDoc, arrayRemove, arrayUnion, collection } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
    User,
} from '../../../../../../../models/core/user.model'
import type { UserNotification } from '../../../../../../../models/core/supporting/user'
import { useImageStorage } from '../../../../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useUserHandleClaim } from '../../mutations/useUserHandleClaim'
import { createUserNotification } from '../ensureHelpers'
import { useUserFormattingAndValidation } from '../validation/useUserFormatting'

function avatarFileExtension(source: File | Blob): string {
  const name =
    typeof File !== 'undefined' && source instanceof File ? source.name : ''
  const fromName = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
  if (fromName) return fromName

  const mime = source.type.toLowerCase()
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

export function useCoreUserUpdate(user: UserRefs) {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const { updateDocument } = useFirestoreUpdate({
    databaseId: identityDatabaseId,
  })
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl, Bio, Handle } = useUserFormattingAndValidation()
  const { claimHandle } = useUserHandleClaim()
  const db = useFirestore(identityDatabaseId)

  const core = user.coreUser as { value: User | undefined }

  const requireCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useCoreUserUpdate] Missing core user id')
    return id
  }

  const updateCore = (data: Record<string, unknown>) =>
    updateDocument<User>('users', requireCoreId(), data as Partial<User>)

  const formatAndValidate = <T>(
    formatter: {
      format: (value: any) => T
      validate: (value: T) => { isValid: boolean; message?: string }
    },
    value: unknown,
    fallbackMessage: string
  ) => {
    const formatted = formatter.format(value)
    const validation = formatter.validate(formatted)
    if (!validation.isValid) {
      throw new Error(validation.message || fallbackMessage)
    }
    return formatted
  }

  const profile = {
    rename: async (displayName: string) => {
      const formatted = formatAndValidate(
        DisplayName,
        displayName,
        'Invalid display name'
      )
      await updateCore({ display_name: formatted })
    },
    setAvatarUrl: async (url: string | null) => {
      const formatted = formatAndValidate(
        AvatarUrl,
        url ?? '',
        'Invalid avatar URL'
      )
      await updateCore({ avatar: formatted || '' })
    },
    uploadAvatar: async (source: File | Blob) => {
      const id = requireCoreId()
      const extension = avatarFileExtension(source)
      const path = `users/${id}/avatar/${Date.now()}.${extension}`
      const url = await uploadImage(path, source)
      await updateCore({ avatar: url })
      return url
    },
    setBio: async (bio: string) => {
      const formatted = formatAndValidate(Bio, bio ?? '', 'Invalid bio')
      await updateCore({ bio: formatted || '' })
    },
    setHandle: async (handle: string) => {
      const normalized = formatAndValidate(Handle, handle ?? '', 'Invalid handle')
      const uid = requireCoreId()
      if (!normalized) throw new Error('Handle cannot be empty.')
      await claimHandle(uid, normalized)
    },
  }

  const normalizeTagId = (value: string) => {
    const trimmed = (value ?? '').trim()
    return trimmed || null
  }

  const tags = {
    add: async (tagId: string) => {
      const normalized = normalizeTagId(tagId)
      if (!normalized) return
      await updateCore({
        profiles: arrayUnion(normalized) as unknown as string[],
      })
    },
    remove: async (tagId: string) => {
      const normalized = normalizeTagId(tagId)
      if (!normalized) return
      await updateCore({
        profiles: arrayRemove(normalized) as unknown as string[],
      })
    },
  }

  const notifications = {
    push: async (message: string) => {
      const id = requireCoreId()
      const notification: UserNotification = createUserNotification({
        message,
        scope: 'ecosystem',
      })

      await addDoc(collection(db, 'users', id, 'notifications'), notification)
      return notification
    },
  }

  const membership = {
    joinApp: async (appId: string, role: 'admin' | 'user' = 'user') => {
      const normalized = String(appId ?? '').trim()
      if (!normalized) return

      await updateCore({
        userOf: arrayUnion(normalized) as unknown as string[],
        adminOf:
          role === 'admin'
            ? (arrayUnion(normalized) as unknown as string[])
            : (arrayRemove(normalized) as unknown as string[]),
      })
    },
    leaveApp: async (appId: string) => {
      const normalized = String(appId ?? '').trim()
      if (!normalized) return

      await updateCore({
        userOf: arrayRemove(normalized) as unknown as string[],
        adminOf: arrayRemove(normalized) as unknown as string[],
      })
    },
  }

  return {
    profile,
    tags,
    notifications,
    membership,
  }
}
