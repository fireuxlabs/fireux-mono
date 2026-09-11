import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../models/customer/order.model.ts'

export function useCustomerOrders() {
  const { currentUser } = useAuth()
  const pageCount = ref(1)
  const loadingMore = ref(false)
  const key = computed(() => `customer-orders:${currentUser.value?.uid || ''}`)
  watch(
    key,
    () => {
      pageCount.value = 1
      loadingMore.value = false
    },
    { flush: 'sync' }
  )
  const state = useLiveAsyncData<CustomerOrderPage>(
    key,
    async (liveFetch) => {
      const user = currentUser.value
      if (!user) return { items: [], nextCursor: null }
      const headers = { Authorization: `Bearer ${await user.getIdToken()}` }
      const items = new Map<string, CustomerOrderSummary>()
      let cursor: string | null = null
      let last: CustomerOrderPage = { items: [], nextCursor: null }
      for (let page = 0; page < pageCount.value; page++) {
        last = await liveFetch<CustomerOrderPage>('/api/customer/orders', {
          headers,
          query: cursor ? { cursor } : {},
        })
        for (const item of last.items) items.set(item.id, item)
        cursor = last.nextCursor
        if (!cursor) break
      }
      return { ...last, items: [...items.values()] }
    },
    { server: false }
  )
  const orders = computed(() => state.data.value?.items || [])
  const hasMore = computed(() => Boolean(state.data.value?.nextCursor))
  const error = computed(() => state.error.value?.message || '')
  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
    } finally {
      loadingMore.value = false
    }
  }
  return {
    orders,
    hasMore,
    error,
    loadingMore,
    loadMore,
    pending: state.pending,
    debug: computed(() => ({
      source: {
        endpoint: '/api/customer/orders',
        customer_uid: currentUser.value?.uid || '',
      },
      projection: state.data.value?.debug,
      state: state.status.value,
    })),
  }
}
