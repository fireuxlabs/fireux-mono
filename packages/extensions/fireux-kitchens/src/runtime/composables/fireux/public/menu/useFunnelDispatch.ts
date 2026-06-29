import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../models/menu/menu-ordering.model'

export function useFunnelDispatch(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  delivery: MaybeRefOrGetter<MenuOrderingDeliveryState | null | undefined>
) {
  const pending = ref(false)
  const error = ref('')
  const pingCount = ref(0)
  const lastPingKey = ref('')
  const menuId = computed(() => text(toValue(order).menuId))
  const kitchenSlug = computed(() => text(toValue(order).kitchenSlug))
  const endpoint = computed(() => {
    if (!menuId.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    const qs = query.toString()

    return `/api/menus/${encodeURIComponent(menuId.value)}/driver-pings${qs ? `?${qs}` : ''}`
  })
  const kitchen = computed(() => {
    const orderType = toValue(order).orderType
    if (orderType !== 'delivery') {
      return {
        title: 'Contacting kitchen',
        status: 'Checking kitchen timing.',
      }
    }

    return {
      title: 'Contacting kitchen',
      status: 'Sending the basket and delivery address.',
    }
  })
  const driverStatus = computed(() => {
    if (toValue(order).orderType !== 'delivery') {
      return 'Driver pings are only needed for delivery orders.'
    }
    if (!toValue(delivery)?.ready) {
      return 'Waiting for a checked delivery address.'
    }
    if (pending.value) return 'Sending a weak delivery beacon.'
    if (error.value) return error.value
    if (pingCount.value > 0) {
      return 'Weak delivery beacon sent.'
    }

    return 'Waiting to send delivery beacon.'
  })

  async function sendDriverPings() {
    const currentOrder = toValue(order)
    const currentDelivery = toValue(delivery)
    const pingKey = [
      endpoint.value,
      currentDelivery?.address?.place_id,
      currentDelivery?.address?.lat,
      currentDelivery?.address?.lng,
      currentOrder.quantity,
      ...currentOrder.items.map((item) => `${item.id}:${item.quantity}`),
    ].join('|')

    if (
      !endpoint.value ||
      currentOrder.orderType !== 'delivery' ||
      !currentDelivery?.ready ||
      !currentDelivery.address?.lat ||
      !currentDelivery.address?.lng ||
      lastPingKey.value === pingKey
    ) {
      return
    }

    pending.value = true
    error.value = ''
    try {
      const response = await $fetch<{ ping_count?: number }>(endpoint.value, {
        method: 'POST',
        body: {
          delivery: currentDelivery,
          basket: currentOrder.selection,
        },
      })
      pingCount.value = Math.max(0, Number(response?.ping_count || 0))
      lastPingKey.value = pingKey
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      error.value = statusMessage || 'Driver beacon could not be sent.'
    } finally {
      pending.value = false
    }
  }

  watch(
    [endpoint, () => toValue(delivery), () => toValue(order).quantity],
    () => {
      void sendDriverPings()
    },
    { immediate: true, deep: true }
  )

  return {
    driverStatus,
    kitchen,
    pending,
    pingCount,
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}
