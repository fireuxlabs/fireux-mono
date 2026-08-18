import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  computed,
  unref,
  type ComputedRef,
  type MaybeRef,
} from 'vue'
import type {
  PublicAppDto,
  PublicDetailResponse,
} from '../../server/utils/public-projection/public-dto.types.ts'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

export type AppDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type AppDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseAppDetailReturn = AppDetailControls & {
  app: ComputedRef<PublicAppDto | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<AppDetailOutcome>
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

/** Resolve one App through the active ecosystem's bounded endpoint. */
export function useAppDetail(
  routeAppId: MaybeRef<string | null | undefined>
): UseAppDetailReturn {
  const fireux = useFireUXConfig()
  const appId = computed(() => String(unref(routeAppId) ?? '').trim())
  const state = useAsyncData<PublicDetailResponse<PublicAppDto> | null>(
    () => [
      'app-detail',
      fireux.ecosystemId || fireux.appId,
      appId.value || 'none',
    ].join('|'),
    async () => {
      if (!appId.value) return null
      return $fetch<PublicDetailResponse<PublicAppDto>>(
        `/api/public/apps/${encodeURIComponent(appId.value)}`
      )
    },
    { server: true, watch: [appId] }
  )
  const app = computed<PublicAppDto | null>(() => {
    const item = state.data.value?.item ?? null
    return item?.id === appId.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !app.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<AppDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    app,
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
