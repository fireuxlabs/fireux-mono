// Concurrent edit — 2026-07-20 16:21 CEST — Repo Efficiency Pass 1 of 6: name the ecosystem-local App projection and reject stale reactive records.

import { useAsyncData } from '#imports'
import { computed, unref, type MaybeRef } from 'vue'
import type {
  PublicAppDto,
  PublicDetailResponse,
} from '../../../../server/utils/public-projection/public-dto.types'

export type EcosystemAppDetailOutcome =
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

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

/** Read one App from the active ecosystem's allowlisted public projection. */
export function useEcosystemAppDetail(
  appId: MaybeRef<string | null | undefined>
) {
  const id = computed(() => String(unref(appId) ?? '').trim())
  const { data, pending, error, refresh } = useAsyncData(
    () => `ecosystem-app-detail-${id.value || 'none'}`,
    async () => {
      if (!id.value) return null
      try {
        return await $fetch<PublicDetailResponse<PublicAppDto>>(
          `/api/public/apps/${encodeURIComponent(id.value)}`
        )
      } catch (cause) {
        if (statusCode(cause) === 404) return null
        throw cause
      }
    },
    {
      server: true,
      watch: [id],
    }
  )

  const app = computed<PublicAppDto | null>(() => {
    const item = data.value?.item
    if (!item || pending.value) return null

    const requestedId = id.value
    const matchesRequest = item.id === requestedId || item.slug === requestedId
    return matchesRequest ? item : null
  })
  const outcome = computed<EcosystemAppDetailOutcome>(() => {
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return app.value ? 'ready' : 'missing'
  })

  return {
    app,
    pending,
    error,
    outcome,
    refresh,
  }
}
