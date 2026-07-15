import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { text } from './order-input'
import type {
  KitchenOrderFunnelStatus,
  UseMenuOrderStatusOptions,
} from './types'

export function useOrderStatus(
  menuId: MaybeRefOrGetter<string>,
  orderId: MaybeRefOrGetter<string | null | undefined>,
  options: UseMenuOrderStatusOptions = {}
) {
  const status = ref<KitchenOrderFunnelStatus | null>(null)
  const pending = ref(false)
  const error = ref('')
  const available = ref(true)
  let timer: number | null = null

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
  const enabled = computed(() =>
    available.value &&
      toValue(options.enabled) !== false &&
      Boolean(endpoint.value)
  )

  async function refresh() {
    if (!enabled.value) return null

    pending.value = true
    error.value = ''
    try {
      const nextStatus = await $fetch<KitchenOrderFunnelStatus>(endpoint.value)
      status.value = nextStatus
      return nextStatus
    } catch (err) {
      const statusCode = err && typeof err === 'object' && 'statusCode' in err
        ? Number((err as { statusCode?: unknown }).statusCode)
        : 0
      if (statusCode === 404) {
        status.value = null
        error.value = 'Order status is no longer available.'
        available.value = false
        return null
      }

      error.value = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : 'Order status could not be checked.'
      return null
    } finally {
      pending.value = false
    }
  }

  function stop() {
    if (!timer) return
    window.clearTimeout(timer)
    timer = null
  }

  function schedule() {
    stop()
    if (!import.meta.client || !enabled.value) return
    timer = window.setTimeout(async () => {
      await refresh()
      schedule()
    }, 2500)
  }

  watch(enabled, (isEnabled: boolean) => {
    if (!isEnabled) {
      stop()
      return
    }

    refresh()
    schedule()
  }, { immediate: true })

  watch(endpoint, () => {
    status.value = null
    error.value = ''
    available.value = true
  })

  onBeforeUnmount(stop)

  return {
    error,
    pending,
    refresh,
    status,
    stop,
  }
}
