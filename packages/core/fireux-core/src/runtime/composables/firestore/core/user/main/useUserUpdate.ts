import { computed } from 'vue'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import type {
  User,
  AppUser,
  UserNotification,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import { useUserFormattingAndValidation } from '../utils/forms/useUserFormatting.ts'
import { createUserNotification } from '../utils/ensureHelpers.ts'

type CoreProfileActions = {
  rename: (displayName: string) => Promise<void>
  setAvatarUrl: (url: string | null) => Promise<void>
  uploadAvatar: (source: File | Blob) => Promise<string>
}

type CoreTagActions = {
  add: (profileId: string) => Promise<void>
  remove: (profileId: string) => Promise<void>
}

type CoreNotificationActions = {
  push: (message: string) => Promise<UserNotification>
}

type AppMembershipActions = {
  setRole: (role: 'user' | 'admin') => Promise<void>
}

type AppNotificationActions = {
  push: (message: string) => Promise<UserNotification>
}

export function useCoreUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl } = useUserFormattingAndValidation()

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
  }

  const normalizeProfileId = (value: string) => {
    const trimmed = (value ?? '').trim()
    return trimmed || null
  }

  const tags: CoreTagActions = {
    add: async (profileId) => {
      const normalized = normalizeProfileId(profileId)
      if (!normalized) return
      const id = requireCoreId()
      await updateDocument<User>('users', id, {
        profiles: arrayUnion(normalized) as unknown as string[],
      })
    },
    remove: async (profileId) => {
      const normalized = normalizeProfileId(profileId)
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
    // Legacy flat API (maintained for backwards compatibility)
    updateDisplayName: profile.rename,
    updateAvatarUrl: profile.setAvatarUrl,
    uploadAvatar: profile.uploadAvatar,
    addProfileTag: tags.add,
    removeProfileTag: tags.remove,
    addCoreNotification: notifications.push,
  }
}

export function useAppUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const app = user.appUser as { value: AppUser | undefined }

  const requireAppContext = () => {
    const id = app.value?.id
    if (!appId || !id)
      throw new Error('[useAppUserUpdate] Missing appId or app user id')
    return { appDocId: id, appId }
  }

  const membership: AppMembershipActions = {
    setRole: async (role) => {
      const { appDocId, appId: activeAppId } = requireAppContext()
      await updateDocument(`apps/${activeAppId}/users`, appDocId, { role })
    },
  }

  const notifications: AppNotificationActions = {
    push: async (message) => {
      const { appDocId, appId: activeAppId } = requireAppContext()
      const notification = createUserNotification({
        message,
        scope: 'app',
        appId: activeAppId,
      })
      await updateDocument<AppUser>(`apps/${activeAppId}/users`, appDocId, {
        notifications: arrayUnion(
          notification
        ) as unknown as UserNotification[],
      })
      return notification
    },
  }

  return {
    membership,
    notifications,
    // Legacy flat API
    updateAppRole: membership.setRole,
    addAppNotification: notifications.push,
  }
}

export function useUserUpdate(user: UserRefs) {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)

  return {
    core,
    app,
    ...core,
    ...app,
  }
}

export function useUserUpdateForUid(uid: string) {
  const coreUser = computed<User | null>(
    () =>
      ({
        id: uid,
      } as User)
  )
  const appUser = computed<AppUser | null>(() => null)
  const user = computed<User | null>(() => coreUser.value)
  const pending = computed(() => false)

  return useUserUpdate({
    user,
    coreUser,
    appUser,
    pending,
  } as UserRefs)
}
