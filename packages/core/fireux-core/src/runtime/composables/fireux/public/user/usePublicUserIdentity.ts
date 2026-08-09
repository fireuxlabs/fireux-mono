// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: read claimant identity through the exact public API.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type {
  PublicDetailResponse,
  PublicUserIdentityDto,
} from '../../../../server/utils/public-projection/public-dto.types'

export type PublicUserIdentityOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

export const publicUserIdentityAsyncDataKey = (id: string) =>
  `public-user-identity-${id || 'none'}`

type PublicUserIdentityControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicUserIdentityReturn = PublicUserIdentityControls & {
  user: ComputedRef<PublicUserIdentityDto | null>
  outcome: ComputedRef<PublicUserIdentityOutcome>
}

function statusCode(error: unknown) {
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

export function usePublicUserIdentity(
  userId: MaybeRef<string | null | undefined>
): UsePublicUserIdentityReturn {
  const id = computed(() => String(unref(userId) ?? '').trim())
  const state = useAsyncData(
    () => publicUserIdentityAsyncDataKey(id.value),
    async () => {
      if (!id.value) return null
      try {
        return await $fetch<PublicDetailResponse<PublicUserIdentityDto>>(
          `/api/public/user-identities/${encodeURIComponent(id.value)}`
        )
      } catch (cause) {
        if (statusCode(cause) === 404) return null
        throw cause
      }
    },
    { server: true, watch: [id] }
  )

  const user = computed<PublicUserIdentityDto | null>(() => {
    const item = state.data.value?.item
    return item?.id === id.value ? item : null
  })
  const outcome = computed<PublicUserIdentityOutcome>(() => {
    if (!id.value) return 'idle'
    if (state.pending.value) return 'pending'
    if (state.error.value) return 'error'
    return user.value ? 'ready' : 'missing'
  })

  return {
    user,
    pending: state.pending,
    error: state.error,
    outcome,
    refresh: state.refresh,
  }
}
