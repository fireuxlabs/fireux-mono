import { useAsyncData } from 'nuxt/app'

import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import type { CollectionResponse } from '../../../models/utils/directory.ts'
import type {
  ProfileDirectoryEntry,
  ProfileUser,
} from '../../models/user-directory.model.ts'

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
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return fetchRead<
        CollectionResponse<ProfileDirectoryEntry<TProfilePayload>>
      >(`/api/${options.collection}`)
    },
    { server: true, lazy: false }
  )

  const entries = computed<ProfileDirectoryEntry<TProfilePayload>[]>(() =>
    error.value ? [] : (data.value?.items ?? [])
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
