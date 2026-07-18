import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../../models/customer/order.model'

export function useCustomerOrders() {
  const { currentUser } = useAuth()
  const orders = ref<CustomerOrderSummary[]>([])
  const pending = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const nextCursor = ref<string | null>(null)

  const hasMore = computed(() => Boolean(nextCursor.value))

  async function load(options: { append?: boolean } = {}) {
    const user = currentUser.value
    if (!user || pending.value || loadingMore.value) return

    const append = Boolean(options.append)
    if (append && !nextCursor.value) return
    const state = append ? loadingMore : pending
    state.value = true
    error.value = ''

    try {
      const token = await user.getIdToken()
      const query = append && nextCursor.value
        ? `?cursor=${encodeURIComponent(nextCursor.value)}`
        : ''
      const page = await $fetch<CustomerOrderPage>(`/api/customer/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const pageItems = Array.isArray(page?.items) ? page.items : []
      orders.value = append ? [...orders.value, ...pageItems] : pageItems
      nextCursor.value = typeof page?.nextCursor === 'string'
        ? page.nextCursor
        : null
    } catch (caught) {
      error.value = requestError(caught)
    } finally {
      state.value = false
    }
  }

  function refresh() {
    nextCursor.value = null
    return load()
  }

  watch(
    currentUser,
    (user) => {
      orders.value = []
      nextCursor.value = null
      error.value = ''
      if (user) void load()
    },
    { immediate: true }
  )

  return {
    error,
    hasMore,
    loadMore: () => load({ append: true }),
    loadingMore,
    orders,
    pending,
    refresh,
  }
}

function requestError(caught: unknown) {
  if (caught && typeof caught === 'object' && 'statusMessage' in caught) {
    const message = String((caught as { statusMessage?: unknown }).statusMessage ?? '').trim()
    if (message) return message
  }
  return caught instanceof Error ? caught.message : 'Orders could not be loaded.'
}
