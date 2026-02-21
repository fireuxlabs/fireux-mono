import { addDoc, arrayRemove, arrayUnion, collection, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type {
    User,
} from '../../../../../../../models/core/user.model'
import type { UserNotification } from '../../../../../../../models/core/user.supporting'
import { useImageStorage } from '../../../../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useUserHandleClaim } from '../../mutations/useUserHandleClaim'
import { createUserNotification } from '../ensureHelpers'
import { useUserFormattingAndValidation } from '../validation/useUserFormatting'

export function useCoreUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl, Bio, Handle } = useUserFormattingAndValidation()
  const { claimHandle } = useUserHandleClaim()
  const db = useFirestore()

  const core = user.coreUser as { value: User | undefined }

  const requireCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useCoreUserUpdate] Missing core user id')
    return id
  }

  const updateCore = (data: Partial<User>) =>
    updateDocument<User>('users', requireCoreId(), data)

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
      const path = `users/${id}/avatar/current`
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

      const docRef = await addDoc(collection(db, 'users', id, 'notifications'), notification)
      await setDoc(docRef, { id: docRef.id }, { merge: true })
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
