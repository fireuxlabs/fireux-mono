import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  computed,
  unref,
  type ComputedRef,
  type MaybeRef,
} from 'vue'
import { useFireUXConfig } from '../app/FireUXConfig'
import type {
  PublicDetailResponse,
  PublicUserDto,
} from '../../../server/utils/public-projection/public-dto.types'

export type UserDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type UserDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseUserDetailReturn = UserDetailControls & {
  user: ComputedRef<PublicUserDto | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<UserDetailOutcome>
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

/** Resolve one User page through its bounded endpoint. */
export function useUserDetail(
  routeHandle: MaybeRef<string | null | undefined>
): UseUserDetailReturn {
  const fireux = useFireUXConfig()
  const handle = computed(() =>
    String(unref(routeHandle) ?? '')
      .trim()
      .toLowerCase()
  )
  const state = useAsyncData<PublicDetailResponse<PublicUserDto> | null>(
    () => [
      'user-detail',
      fireux.appId,
      handle.value || 'none',
    ].join('|'),
    async () => {
      if (!handle.value) return null
      return $fetch<PublicDetailResponse<PublicUserDto>>(
        `/api/public/users/${encodeURIComponent(handle.value)}`
      )
    },
    { server: true, watch: [handle] }
  )

  const user = computed<PublicUserDto | null>(() => {
    const item = state.data.value?.item ?? null
    return item?.handle === handle.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !user.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<UserDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    user,
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
