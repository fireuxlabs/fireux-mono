import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import { useUserFormattingAndValidation } from '../utils/forms/useUserFormatting.ts'

export function useUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl } = useUserFormattingAndValidation()

  const core = user.coreUser as { value: User | undefined }
  const app = user.appUser as { value: AppUser | undefined }

  const ensureCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useUserUpdate] Missing core user id')
    return id
  }

  const updateDisplayName = async (display_name: string) => {
    const id = ensureCoreId()
    const formatted = DisplayName.format(display_name)
    const result = DisplayName.validate(formatted)
    if (!result.isValid) {
      throw new Error(result.message || 'Invalid display name')
    }
    await updateDocument<User>('users', id, { display_name: formatted })
  }

  const updateAvatarUrl = async (value: string | null) => {
    const id = ensureCoreId()
    const formatted = AvatarUrl.format(value ?? '')
    const result = AvatarUrl.validate(formatted)
    if (!result.isValid) {
      throw new Error(result.message || 'Invalid avatar URL')
    }
    await updateDocument<User>('users', id, { avatar: formatted || '' })
  }

  const uploadAvatar = async (source: File | Blob) => {
    const id = ensureCoreId()
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    const path = `users/${id}/avatar/${token}`
    const url = await uploadImage(path, source)
    await updateDocument<User>('users', id, { avatar: url })
    return url
  }

  const updateAppRole = async (role: 'user' | 'admin') => {
    const id = app.value?.id
    if (!appId || !id)
      throw new Error('[useUserUpdate] Missing appId or app user id')
    await updateDocument(`apps/${appId}/users`, id, { role })
  }

  return {
    updateDisplayName,
    updateAvatarUrl,
    uploadAvatar,
    updateAppRole,
  }
}
