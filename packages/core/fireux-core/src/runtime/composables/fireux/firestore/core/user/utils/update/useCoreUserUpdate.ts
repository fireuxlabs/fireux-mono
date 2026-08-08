// Concurrent edit — 2026-07-20 13:18 CEST — User identity pass: sync only public profiles; app-private records no longer duplicate User identity.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: make User the only public identity write target.
// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: preserve a canonical safe avatar on clear and upload.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: construct Firebase write and Storage clients only when a User edit runs.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: expose biography through the canonical public User updater.
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../../vuefire'
import {
  UserStorage,
  type User,
} from '../../../../../../../models/core/user.model'
import { useImageStorage } from '../../../../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import { ensureAvatarUrl } from '../../../../utils/useEnsureCommon'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useUserHandleUpdate } from '../../mutations/useUserHandleUpdate'
import { useUserFormattingAndValidation } from '../validation/useUserFormatting'
import { USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE } from '../../../../../../../utils/user-avatar'

function avatarFileExtension(source: File | Blob): string {
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

export function useCoreUserUpdate(user: UserRefs) {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const { DisplayName, Bio, AvatarUrl, Handle } =
    useUserFormattingAndValidation()
  const { updateHandle } = useUserHandleUpdate()
  const core = user.coreUser as { value: User | undefined }

  const requireCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useCoreUserUpdate] Missing core user id')
    return id
  }

  const updateCore = (data: Record<string, unknown>) =>
    useFirestoreUpdate({ databaseId: identityDatabaseId }).updateDocument<User>(
      UserStorage.collection,
      requireCoreId(),
      data as Partial<User>
    )

  const updateCorePublicIdentity = (data: Partial<User>) => updateCore(data)

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
      await updateCorePublicIdentity({ display_name: formatted })
    },
    setBio: async (bio: string) => {
      const formatted = formatAndValidate(Bio, bio, 'Invalid bio')
      await updateCorePublicIdentity({ bio: formatted })
    },
    setAvatarUrl: async (url: string | null) => {
      const formatted = formatAndValidate(
        AvatarUrl,
        url ?? '',
        'Invalid avatar URL'
      )
      const resolved = formatted
        ? formatted
        : await ensureAvatarUrl(
            `${UserStorage.collection}/${requireCoreId()}/avatar/current`,
            [USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE],
            true,
            {
              fallback: USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE,
            }
          )
      await updateCorePublicIdentity({
        avatar: resolved,
      })
    },
    uploadAvatar: async (source: File | Blob) => {
      const id = requireCoreId()
      const extension = avatarFileExtension(source)
      const path = `${UserStorage.collection}/${id}/avatar/${Date.now()}.${extension}`
      const { uploadImage } = useImageStorage()
      const url = await uploadImage(path, source)
      const formatted = formatAndValidate(
        AvatarUrl,
        url,
        'Avatar upload did not return a valid HTTPS URL'
      )
      await updateCorePublicIdentity({ avatar: formatted })
      return formatted
    },
    setHandle: async (handle: string) => {
      const normalized = formatAndValidate(
        Handle,
        handle ?? '',
        'Invalid handle'
      )
      const uid = requireCoreId()
      if (!normalized) throw new Error('Handle cannot be empty.')
      await updateHandle(uid, normalized)
    },
  }

  return {
    profile,
  }
}
