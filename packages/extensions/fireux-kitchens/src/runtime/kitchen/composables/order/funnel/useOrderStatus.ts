import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { text } from '../../../utils/order-input'
import type {
  KitchenOrderFunnelStatus,
  UseMenuOrderStatusOptions,
} from '../../../models/order-funnel.model'

export function useOrderStatus(
  menuId: MaybeRefOrGetter<string>,
  orderId: MaybeRefOrGetter<string | null | undefined>,
  options: UseMenuOrderStatusOptions = {}
) {
  const available = ref(true)
  const endpoint = computed(() => {
    const id = text(toValue(menuId))
    const order = text(toValue(orderId))
    if (!id || !order) return ''

    const query = new URLSearchParams()
    const kitchenSlug = text(toValue(options.kitchenSlug))
    if (kitchenSlug) query.set('kitchenSlug', kitchenSlug)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id)}/orders/${encodeURIComponent(order)}${qs ? `?${qs}` : ''}`
  })
  const enabled = computed(
    () =>
      available.value &&
      toValue(options.enabled) !== false &&
      Boolean(endpoint.value)
  )

  const state = useLiveAsyncData<KitchenOrderFunnelStatus | null>(
    computed(() => `order-status:${endpoint.value}:${enabled.value}`),
    (liveFetch) =>
      enabled.value
        ? liveFetch<KitchenOrderFunnelStatus>(endpoint.value)
        : Promise.resolve(null),
    { server: false }
  )
  async function refresh() {
    await state.refresh()
    return state.data.value
  }
  function stop() {
    available.value = false
  }
  return {
    error: computed(() => state.error.value?.message || ''),
    pending: state.pending,
    refresh,
    status: state.data,
    stop,
  }
}
