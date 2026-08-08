import { useAsyncData } from '#imports'
import { computed, unref, type MaybeRef } from 'vue'
import type {
  PublicDetailResponse,
  PublicUserDto,
} from '../../../server/utils/public-projection/public-dto.types'

function statusCode(error: unknown): number {
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
export async function useUserDetail(
  routeHandle: MaybeRef<string | null | undefined>
) {
  const handle = computed(() =>
    String(unref(routeHandle) ?? '')
      .trim()
      .toLowerCase()
  )
  const { data, pending, error, refresh } = await useAsyncData(
    () => `user-detail-${handle.value || 'none'}`,
    async () => {
      if (!handle.value) return null
      return $fetch<PublicDetailResponse<PublicUserDto>>(
        `/api/public/users/${encodeURIComponent(handle.value)}`
      )
    },
    { server: true, watch: [handle] }
  )

  const user = computed(() => {
    const item = data.value?.item ?? null
    return item?.handle === handle.value ? item : null
  })
  const code = computed(() => statusCode(error.value))
  const missing = computed(
    () => code.value === 404 || (!pending.value && !error.value && !user.value)
  )
  const failed = computed(() => Boolean(error.value) && code.value !== 404)

  return {
    user,
    pending,
    error,
    refresh,
    statusCode: code,
    missing,
    failed,
  }
}
