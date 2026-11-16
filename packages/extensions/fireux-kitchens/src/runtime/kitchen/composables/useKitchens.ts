import { useAsyncData } from 'nuxt/app'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'

import {
  computed,
  toValue,
  watch,
  onMounted,
  onUnmounted,
  type MaybeRefOrGetter,
  type ComputedRef,
} from 'vue'
import type { KitchenDirectoryEntry } from '../types/public'

export type UseKitchensReturn = {
  collection: ComputedRef<KitchenDirectoryEntry[]>
  count: ComputedRef<number>
  ready: Promise<void>
  outcome: ComputedRef<'idle' | 'pending' | 'error' | 'empty' | 'ready'>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refresh: () => Promise<void>
}

/** Server-rendered Kitchen collection. The client only enhances authorized views. */
export function useKitchens(
  options: { placeId?: MaybeRefOrGetter<string | undefined> } = {}
): UseKitchensReturn {
  const placeId = computed(() => String(toValue(options.placeId) || '').trim())
  const active = computed(
    () => options.placeId === undefined || Boolean(placeId.value)
  )
  const endpoint = computed(() =>
    placeId.value
      ? `/api/kitchens?placeId=${encodeURIComponent(placeId.value)}`
      : '/api/kitchens'
  )
  const state = useAsyncData<KitchenDirectoryEntry[]>(
    () =>
      options.placeId === undefined
        ? 'kitchens'
        : `kitchens:place:${placeId.value || 'inactive'}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return active.value
        ? fetchRead<KitchenDirectoryEntry[]>(endpoint.value)
        : Promise.resolve([])
    },
    { watch: [endpoint, active] }
  )
  const collection = computed<KitchenDirectoryEntry[]>(() => {
    if (!active.value || state.pending.value || state.error.value) return []
    if (options.placeId === undefined) return state.data.value || []
    return (state.data.value || []).filter(
      (kitchen) => kitchen.id === placeId.value
    )
  })
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: active.value,
      pending: state.pending.value,
      failed: Boolean(state.error.value),
      present: collection.value.length > 0,
    })
  )
  let dateTimer: ReturnType<typeof setTimeout> | undefined
  onMounted(() => {
    watch(
      collection,
      () => {
        clearTimeout(dateTimer)
        const boundaries = collection.value.flatMap((kitchen) =>
          kitchen.special ? [kitchen.special.nextChangeAt] : []
        )
        if (boundaries.length)
          dateTimer = setTimeout(
            () => {
              void state.refresh()
            },
            Math.max(1000, Math.min(...boundaries) - Date.now())
          )
      },
      { immediate: true }
    )
  })
  onUnmounted(() => clearTimeout(dateTimer))

  return {
    collection,
    count: computed(() => collection.value.length),
    pending: computed(() => state.pending.value),
    error: computed<unknown>(() => state.error.value),
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    outcome,
  }
}
