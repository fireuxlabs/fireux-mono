import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
} from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from '../../../../../../../models/core/app.model'
import type { User } from '../../../../../../../models/core/user.model'
import {
  UserNotificationStorage,
  UserStorage,
} from '../../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import type { UserNotification } from '../../../../../../../models/core/supporting/user'
import { useImageStorage } from '../../../../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useUserHandleClaim } from '../../mutations/useUserHandleClaim'
import { createUserNotification } from '../createHelpers'
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

const PROFILE_COLLECTION_BY_ID: Record<string, string> = {
  agent: 'agents',
  agents: 'agents',
  chef: 'chefs',
  chefs: 'chefs',
  customer: 'customers',
  customers: 'customers',
  driver: 'drivers',
  drivers: 'drivers',
  professional: 'professionals',
  professionals: 'professionals',
}

export function useCoreUserUpdate(user: UserRefs) {
  const cfg = useFireUXConfig()
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const identityUpdate = useFirestoreUpdate({
    databaseId: identityDatabaseId,
  })
  const appUpdate = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()
  const { DisplayName, AvatarUrl, Handle } = useUserFormattingAndValidation()
  const { claimHandle } = useUserHandleClaim()
  const identityDb = useFirestore(identityDatabaseId)
  const appDb = useFirestore()

  const core = user.coreUser as { value: User | undefined }

  const requireCoreId = () => {
    const id = core.value?.id
    if (!id) throw new Error('[useCoreUserUpdate] Missing core user id')
    return id
  }

  const updateCore = (data: Record<string, unknown>) =>
    identityUpdate.updateDocument<User>(
      UserStorage.rootCollection,
      requireCoreId(),
      data as Partial<User>
    )

  const publicUserSnapshot = (overrides: Partial<User> = {}) => {
    const id = requireCoreId()
    const source = {
      ...(core.value ?? {}),
      ...overrides,
      id,
    }

    return {
      id,
      display_name: String(source.display_name || '').trim(),
      avatar: String(source.avatar || '').trim(),
      handle: String(source.handle || '').trim(),
    }
  }

  const profileCollections = (profiles?: unknown) => {
    const source = Array.isArray(profiles) ? profiles : core.value?.profiles ?? []
    const collections = new Set<string>()

    for (const profile of source) {
      const collectionName =
        PROFILE_COLLECTION_BY_ID[String(profile ?? '').trim().toLowerCase()]
      if (collectionName) collections.add(collectionName)
    }

    return [...collections]
  }

  const appIdsForProfileOverlays = () => {
    const ids = new Set<string>()
    for (const appId of core.value?.app_ids ?? []) {
      const normalized = String(appId || '').trim()
      if (normalized) ids.add(normalized)
    }
    if (cfg.appId) ids.add(cfg.appId)
    return [...ids]
  }

  const updateProfileSnapshotIfPresent = async (
    collectionPath: string,
    id: string,
    data: { user: ReturnType<typeof publicUserSnapshot> },
    scope: 'identity' | 'app'
  ) => {
    const db = scope === 'identity' ? identityDb : appDb
    const exists = (await getDoc(doc(db, collectionPath, id))).exists()
    if (!exists) return

    const updater = scope === 'identity' ? identityUpdate : appUpdate
    await updater.updateDocument(collectionPath, id, data as any)
  }

  const syncAttachedProfileUserSnapshots = async (
    overrides: Partial<User> & { profiles?: string[] } = {}
  ) => {
    const id = requireCoreId()
    const collections = profileCollections(overrides.profiles)
    if (!collections.length) return

    const data = { user: publicUserSnapshot(overrides) }
    const appIds = appIdsForProfileOverlays()

    for (const collectionName of collections) {
      await updateProfileSnapshotIfPresent(collectionName, id, data, 'identity')

      for (const appId of appIds) {
        await updateProfileSnapshotIfPresent(
          `${AppStorage.collection}/${appId}/${collectionName}`,
          id,
          data,
          'app'
        )
      }
    }
  }

  const updateCorePublicIdentity = async (data: Partial<User>) => {
    await updateCore(data)
    await syncAttachedProfileUserSnapshots(data)
  }

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
    setAvatarUrl: async (url: string | null) => {
      const formatted = formatAndValidate(
        AvatarUrl,
        url ?? '',
        'Invalid avatar URL'
      )
      await updateCorePublicIdentity({ avatar: formatted || '' })
    },
    uploadAvatar: async (source: File | Blob) => {
      const id = requireCoreId()
      const extension = avatarFileExtension(source)
      const path = `${UserStorage.rootCollection}/${id}/avatar/${Date.now()}.${extension}`
      const url = await uploadImage(path, source)
      await updateCorePublicIdentity({ avatar: url })
      return url
    },
    setHandle: async (handle: string) => {
      const normalized = formatAndValidate(Handle, handle ?? '', 'Invalid handle')
      const uid = requireCoreId()
      if (!normalized) throw new Error('Handle cannot be empty.')
      const result = await claimHandle(uid, normalized)
      await syncAttachedProfileUserSnapshots({ handle: result.handle })
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
      const profiles = [...new Set([...(core.value?.profiles ?? []), normalized])]
      await updateCore({
        profiles: arrayUnion(normalized) as unknown as string[],
      })
      await syncAttachedProfileUserSnapshots({ profiles })
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

      await addDoc(
        collection(
          identityDb,
          UserStorage.rootCollection,
          id,
          UserNotificationStorage.collection
        ),
        notification
      )
      return notification
    },
  }

  return {
    profile,
    tags,
    notifications,
  }
}
