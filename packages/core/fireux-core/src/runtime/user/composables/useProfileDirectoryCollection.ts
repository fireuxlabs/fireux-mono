// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: consume bounded server DTOs without raw Firestore lists.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: type directory payloads and enriched rows without compatibility casts.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable profile collection declarations.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import type { CollectionResponse } from '../../models/utils/directory.ts'
import type {
  ProfileDirectoryEntry,
  ProfileUser,
} from '../models/user-directory.model.ts'

type ProfileDirectoryOptions = {
  collection: 'agents' | 'chefs' | 'drivers' | 'professionals'
}

export type ProfileDirectoryRecord<
  TProfilePayload extends Record<string, unknown>,
> = TProfilePayload & { id: string }

export type ProfileDirectoryOutcome = 'pending' | 'error' | 'ready' | 'empty'

type ProfileDirectoryControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseProfileDirectoryCollectionReturn<
  TProfilePayload extends Record<string, unknown>,
> = ProfileDirectoryControls & {
  profiles: ComputedRef<ProfileDirectoryRecord<TProfilePayload>[]>
  profileUsers: ComputedRef<ProfileUser[]>
  usersById: ComputedRef<Map<string, ProfileUser>>
  userById: (id: string | null | undefined) => ProfileUser | undefined
  count: ComputedRef<number>
  outcome: ComputedRef<ProfileDirectoryOutcome>
}

export function useProfileDirectoryCollection<
  TProfilePayload extends Record<string, unknown>,
>(
  options: ProfileDirectoryOptions
): UseProfileDirectoryCollectionReturn<TProfilePayload> {
  const key = `profile-directory-${options.collection}`
  const { data, pending, error, refresh } = useAsyncData(
    key,
    () =>
      $fetch<CollectionResponse<ProfileDirectoryEntry<TProfilePayload>>>(
        `/api/${options.collection}`
      ),
    { server: true, lazy: false }
  )

  const entries = computed<ProfileDirectoryEntry<TProfilePayload>[]>(
    () => data.value?.items ?? []
  )
  const profiles = computed<ProfileDirectoryRecord<TProfilePayload>[]>(() =>
    entries.value.map((entry) =>
      Object.assign({}, entry.profile, { id: entry.id })
    )
  )
  const profileUsers = computed<ProfileUser[]>(() =>
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
