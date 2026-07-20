// Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: own endpoint-first SSR profile detail state.
import { useAsyncData } from '#imports'
import { computed, unref, type MaybeRef } from 'vue'
import type {
  PublicDetailResponse,
  PublicProfileDto,
} from '../../../../server/utils/public-projection/public-dto.types'

export type PublicProfileCollection =
  | 'agents'
  | 'chefs'
  | 'drivers'
  | 'professionals'

export type PublicProfileDetailOutcome =
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

type PublicProfileDetailOptions =
  | { collection: 'agents'; kind: 'agent' }
  | { collection: 'chefs'; kind: 'chef' }
  | { collection: 'drivers'; kind: 'driver' }
  | { collection: 'professionals'; kind: 'professional' }

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

/** Read one canonical User/profile pair through its allowlisted public API. */
export async function usePublicProfileDetail<
  TProfile extends Record<string, unknown>,
>(
  options: PublicProfileDetailOptions,
  profileId: MaybeRef<string | null | undefined>
) {
  const id = computed(() => String(unref(profileId) ?? '').trim())
  const { data, pending, error, refresh } = await useAsyncData(
    () => `public-profile-detail-${options.collection}-${id.value || 'none'}`,
    async () => {
      if (!id.value) return null
      return $fetch<PublicDetailResponse<PublicProfileDto<TProfile>>>(
        `/api/public/${options.collection}/${encodeURIComponent(id.value)}`
      )
    },
    {
      server: true,
      watch: [id],
    }
  )

  const entry = computed<PublicProfileDto<TProfile> | null>(() => {
    const item = data.value?.item
    if (
      !item ||
      pending.value ||
      item.id !== id.value ||
      item.kind !== options.kind
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
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!pending.value && !error.value && !entry.value)
  )
  const failed = computed(
    () => Boolean(error.value) && statusCode.value !== 404
  )
  const outcome = computed<PublicProfileDetailOutcome>(() => {
    if (pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    entry,
    profile,
    user,
    pending,
    error,
    statusCode,
    missing,
    failed,
    outcome,
    refresh,
  }
}
