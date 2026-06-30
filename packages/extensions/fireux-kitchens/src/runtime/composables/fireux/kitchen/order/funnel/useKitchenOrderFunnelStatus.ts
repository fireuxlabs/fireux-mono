import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

export type KitchenOrderFunnelStatus = {
  id: string
  order_number: string
  status: string
  order_type: string
  fire_state: string
  estimated_ready_minutes: number
  estimated_ready_at: string
}

type UseMenuOrderStatusOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  enabled?: MaybeRefOrGetter<boolean>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderFunnelStatus(
  menuId: MaybeRefOrGetter<string>,
  orderId: MaybeRefOrGetter<string | null | undefined>,
  options: UseMenuOrderStatusOptions = {}
) {
  const status = ref<KitchenOrderFunnelStatus | null>(null)
  const pending = ref(false)
  const error = ref('')
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
    toValue(options.enabled) !== false && Boolean(endpoint.value)
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
      status.value = null
      return
    }

    refresh()
    schedule()
  }, { immediate: true })

  onBeforeUnmount(stop)

  return {
    status,
    pending,
    error,
    refresh,
    stop,
  }
}
