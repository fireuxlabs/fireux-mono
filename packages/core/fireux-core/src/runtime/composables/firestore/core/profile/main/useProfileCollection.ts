import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

export function useProfileCollection<
  TProfile extends Partial<Profile> = Profile
>(config: ProfileConfig) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { users } = useUserCollection()

  const globalProfiles = useCollection<TProfile>(
    collection(db, config.collectionName) as any
  )

  const localProfiles =
    isTenant && appId
      ? useCollection<Partial<TProfile>>(
          collection(db, 'apps', appId, config.collectionName) as any
        )
      : null

  const usersById = computed<Map<string, User>>(() => {
    const entries = users.value ?? []
    return new Map(entries.map((entry) => [entry.id, entry]))
  })

  const ensureString = (value?: unknown): string =>
    typeof value === 'string' ? value.trim() : ''

  const enrichProfile = (profile: Partial<TProfile>): TProfile => {
    const base: any = { ...profile }
    const user = base?.id ? usersById.value.get(base.id) : undefined

    if (user) {
      const currentUser = ensureRecord(base.user)
      base.user = {
        ...currentUser,
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar,
        handle: user.handle,
      }

      if (!ensureString(base.title)) {
        base.title = ensureString(user.display_name) || config.profileType
      }

      if (hasAvatarField(base) && !ensureString(base.avatar) && user.avatar) {
        base.avatar = user.avatar
      }

      if (
        hasAvatarUrlField(base) &&
        !ensureString(base.avatar_url) &&
        user.avatar
      ) {
        base.avatar_url = user.avatar
      }
    } else {
      if (!ensureString(base.title)) {
        base.title = config.profileType
      }
    }

    return base as TProfile
  }

  const enrichList = (entries?: readonly Partial<TProfile>[] | null) => {
    if (!entries?.length) return [] as TProfile[]
    return entries.map((entry) => enrichProfile({ ...(entry ?? {}) }))
  }

  const globalProfilesWithUser = computed<TProfile[]>(() =>
    enrichList(globalProfiles.value as Partial<TProfile>[] | undefined)
  )

  const localProfilesWithUser = localProfiles
    ? computed<TProfile[]>(() =>
        enrichList(localProfiles.value as Partial<TProfile>[] | undefined)
      )
    : null

  return {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
    usersById,
  }

  function ensureRecord(value: unknown): Record<string, any> {
    return value && typeof value === 'object'
      ? (value as Record<string, any>)
      : {}
  }

  function hasAvatarField(target: any): target is { avatar?: string | null } {
    return Object.prototype.hasOwnProperty.call(target, 'avatar')
  }

  function hasAvatarUrlField(target: any): target is {
    avatar_url?: string | null
  } {
    return Object.prototype.hasOwnProperty.call(target, 'avatar_url')
  }
}
