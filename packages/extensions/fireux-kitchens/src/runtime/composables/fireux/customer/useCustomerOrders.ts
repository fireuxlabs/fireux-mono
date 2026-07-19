import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../../models/customer/order.model'

export function useCustomerOrders() {
  const { currentUser } = useAuth()
  let mounted = false
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  const orders = ref<CustomerOrderSummary[]>([])
  const pending = ref(false)
  const refreshing = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const nextCursor = ref<string | null>(null)

  const hasMore = computed(() => Boolean(nextCursor.value))

  async function load(options: { append?: boolean, background?: boolean } = {}) {
    const user = currentUser.value
    if (!user || pending.value || refreshing.value || loadingMore.value) return
    const requestUid = user.uid

    const append = Boolean(options.append)
    const background = Boolean(options.background)
    if (append && !nextCursor.value) return
    const state = append ? loadingMore : background ? refreshing : pending
    state.value = true
    if (!background) error.value = ''

    try {
      const token = await user.getIdToken()
      const query = append && nextCursor.value
        ? `?cursor=${encodeURIComponent(nextCursor.value)}`
        : ''
      const page = await $fetch<CustomerOrderPage>(`/api/customer/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (currentUser.value?.uid !== requestUid) return

      const pageItems = Array.isArray(page?.items) ? page.items : []
      if (append) {
        orders.value = [...orders.value, ...pageItems]
      } else if (background) {
        const freshIds = new Set(pageItems.map(order => order.id))
        orders.value = [
          ...pageItems,
          ...orders.value.filter(order => !freshIds.has(order.id)),
        ]
      } else {
        orders.value = pageItems
      }
      if (!background) {
        nextCursor.value = typeof page?.nextCursor === 'string'
          ? page.nextCursor
          : null
      }
      error.value = ''
    } catch (caught) {
      if (!background || !orders.value.length) {
        error.value = requestError(caught)
      }
    } finally {
      state.value = false
    }
  }

  function scheduleRefresh(delay = 10_000) {
    stopRefresh()
    if (!import.meta.client || !mounted || !currentUser.value) return

    refreshTimer = setTimeout(async () => {
      if (document.visibilityState === 'visible') {
        await load({ background: true })
      }
      scheduleRefresh()
    }, delay)
  }

  function stopRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = undefined
  }

  watch(
    currentUser,
    (user) => {
      orders.value = []
      nextCursor.value = null
      error.value = ''
      stopRefresh()
      if (mounted && user) {
        void load()
        scheduleRefresh()
      }
    }
  )

  onMounted(() => {
    mounted = true
    if (currentUser.value) {
      void load()
      scheduleRefresh()
    }
  })
  onBeforeUnmount(stopRefresh)

  return {
    error,
    hasMore,
    loadMore: () => load({ append: true }),
    loadingMore,
    orders,
    pending,
  }
}

function requestError(caught: unknown) {
  if (caught && typeof caught === 'object' && 'statusMessage' in caught) {
    const message = String((caught as { statusMessage?: unknown }).statusMessage ?? '').trim()
    if (message) return message
  }
  return caught instanceof Error ? caught.message : 'Orders could not be loaded.'
}
