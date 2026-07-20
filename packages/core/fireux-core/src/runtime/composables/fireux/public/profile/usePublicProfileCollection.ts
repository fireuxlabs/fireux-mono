// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: consume bounded server DTOs without raw Firestore lists.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: type directory payloads and enriched rows without compatibility casts.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable profile collection declarations.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import type {
  PublicCollectionResponse,
  PublicProfileDto,
  PublicProfileUserDto,
} from '../../../../server/utils/public-projection/public-dto.types'

type PublicProfileCollectionOptions = {
  collection: 'agents' | 'chefs' | 'drivers' | 'professionals'
}

export type PublicProfileDirectoryEntry<
  TProfilePayload extends Record<string, unknown>,
> = TProfilePayload & { id: string }

export type PublicProfileCollectionOutcome =
  | 'pending'
  | 'error'
  | 'ready'
  | 'empty'

type PublicProfileCollectionControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicProfileCollectionReturn<
  TProfilePayload extends Record<string, unknown>,
> = PublicProfileCollectionControls & {
  profiles: ComputedRef<PublicProfileDirectoryEntry<TProfilePayload>[]>
  profileUsers: ComputedRef<PublicProfileUserDto[]>
  usersById: ComputedRef<Map<string, PublicProfileUserDto>>
  userById: (id: string | null | undefined) => PublicProfileUserDto | undefined
  count: ComputedRef<number>
  outcome: ComputedRef<PublicProfileCollectionOutcome>
}

export function usePublicProfileCollection<
  TProfilePayload extends Record<string, unknown>,
>(
  options: PublicProfileCollectionOptions
): UsePublicProfileCollectionReturn<TProfilePayload> {
  const key = `public-profile-directory-${options.collection}`
  const { data, pending, error, refresh } = useAsyncData(
    key,
    () =>
      $fetch<PublicCollectionResponse<PublicProfileDto<TProfilePayload>>>(
        `/api/public/${options.collection}`
      ),
    { server: true, lazy: false }
  )

  const entries = computed<PublicProfileDto<TProfilePayload>[]>(
    () => data.value?.items ?? []
  )
  const profiles = computed<PublicProfileDirectoryEntry<TProfilePayload>[]>(
    () =>
      entries.value.map((entry) =>
        Object.assign({}, entry.profile, { id: entry.id })
      )
  )
  const profileUsers = computed<PublicProfileUserDto[]>(() =>
    entries.value.map((entry) => entry.user)
  )
  const usersById = computed(
    () => new Map(profileUsers.value.map((user) => [user.id, user]))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined
  const count = computed(() => profiles.value.length)
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
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
