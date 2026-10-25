import { useLiveAsyncData } from '../../../composables/fireux/firestore/useLiveAsyncData'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { DetailResponse } from '../../../models/utils/directory.ts'
import type { ProfileDirectoryEntry } from '../../models/user-directory.model.ts'

export type ProfileCollection = 'agents' | 'chefs' | 'drivers' | 'professionals'

export type ProfileDetailOutcome = 'pending' | 'ready' | 'empty' | 'error'

type ProfileDetailOptions =
  | { collection: 'agents'; kind: 'agent' }
  | { collection: 'chefs'; kind: 'chef' }
  | { collection: 'drivers'; kind: 'driver' }
  | { collection: 'professionals'; kind: 'professional' }

type ProfileDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseProfileDetailReturn<TProfile extends Record<string, unknown>> =
  ProfileDetailControls & {
    entry: ComputedRef<ProfileDirectoryEntry<TProfile> | null>
    profile: ComputedRef<(TProfile & { id: string }) | null>
    user: ComputedRef<ProfileDirectoryEntry<TProfile>['user'] | null>
    statusCode: ComputedRef<number>
    empty: ComputedRef<boolean>
    failed: ComputedRef<boolean>
    outcome: ComputedRef<ProfileDetailOutcome>
  }

function readStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

/** Read one canonical User/Profile pair through its bounded Entity endpoint. */
export async function useProfileDetail<
  TProfile extends Record<string, unknown>,
>(
  options: ProfileDetailOptions,
  profileIdentifier: MaybeRef<string | null | undefined>
): Promise<UseProfileDetailReturn<TProfile>> {
  const identifier = computed(() =>
    String(unref(profileIdentifier) ?? '').trim()
  )
  const { data, pending, error, refresh } = await useLiveAsyncData(
    () => `profile-detail-${options.collection}-${identifier.value || 'none'}`,
    async (liveFetch) => {
      if (!identifier.value) return null
      return liveFetch<DetailResponse<ProfileDirectoryEntry<TProfile>>>(
        `/api/${options.collection}/${encodeURIComponent(identifier.value)}`
      )
    },
    {
      server: true,
      watch: [identifier],
    }
  )

  const entry = computed<ProfileDirectoryEntry<TProfile> | null>(() => {
    const item = data.value?.item
    if (
      error.value ||
      !item ||
      pending.value ||
      item.kind !== options.kind ||
      (item.id !== identifier.value &&
        item.user.handle !== identifier.value.toLowerCase())
    ) {
      return null
    }
    return item
  })
  const profile = computed<(TProfile & { id: string }) | null>(() => {
    const item = entry.value
    return item ? Object.assign({ id: item.id }, item.profile) : null
  })
  const user = computed(() => entry.value?.user ?? null)
  const statusCode = computed(() => readStatusCode(error.value))
  const empty = computed(
    () =>
      statusCode.value === 404 ||
      (!pending.value && !error.value && !entry.value)
  )
  const failed = computed(
    () => Boolean(error.value) && statusCode.value !== 404
  )
  const outcome = computed<ProfileDetailOutcome>(() => {
    if (pending.value) return 'pending'
    if (failed.value) return 'error'
    if (empty.value) return 'empty'
    return 'ready'
  })

  return {
    entry,
    profile,
    user,
    pending,
    error,
    statusCode,
    empty,
    failed,
    outcome,
    refresh,
  }
}
