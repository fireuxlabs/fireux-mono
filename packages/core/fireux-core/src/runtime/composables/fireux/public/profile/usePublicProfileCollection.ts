// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: consume bounded server DTOs without raw Firestore lists.
import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { ProfileRecord } from '../../../../models/core/profile.model'
import type {
  PublicCollectionResponse,
  PublicProfileDto,
  PublicProfileUserDto,
} from '../../../../server/utils/public-projection/public-dto.types'

type PublicProfileCollectionOptions = {
  collection: 'agents' | 'chefs' | 'drivers' | 'professionals'
}

export function usePublicProfileCollection<TProfile extends ProfileRecord>(
  options: PublicProfileCollectionOptions
) {
  const key = `public-profile-directory-${options.collection}`
  const { data, pending, error, refresh } = useAsyncData(
    key,
    () =>
      $fetch<PublicCollectionResponse<PublicProfileDto>>(
        `/api/public/${options.collection}`
      ),
    { server: true, lazy: false }
  )

  const entries = computed(() => data.value?.items ?? [])
  const profiles = computed<TProfile[]>(() =>
    entries.value.map((entry) => ({
      ...entry.profile,
      id: entry.id,
    }) as TProfile)
  )
  const profileUsers = computed<PublicProfileUserDto[]>(() =>
    entries.value.map((entry) => entry.user)
  )
  const usersById = computed(() =>
    new Map(profileUsers.value.map((user) => [user.id, user]))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined
  const count = computed(() => profiles.value.length)
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (error.value) return 'error' as const
    return count.value ? 'ready' as const : 'empty' as const
  })

  return {
    profiles,
    profileUsers,
    usersById,
    userById,
    count,
    pending,
    error,
    outcome,
    refresh,
  }
}
