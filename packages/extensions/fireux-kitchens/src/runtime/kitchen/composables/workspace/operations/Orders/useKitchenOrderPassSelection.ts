import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { KitchenOrder } from '../../../../utils/order.ts'

type KitchenOrderPassSelectionOptions = {
  canOperate: MaybeRefOrGetter<boolean>
  orders: MaybeRefOrGetter<KitchenOrder[]>
  isTransitioning: (orderId: string) => boolean
  completeOrder: (orderId: string) => Promise<unknown>
}

const orderId = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderPassSelection(
  options: KitchenOrderPassSelectionOptions
) {
  const selectedOrderIds = ref<string[]>([])
  const sending = ref(false)
  const selectedOrders = computed(() => {
    const selectedIds = new Set(selectedOrderIds.value)
    return toValue(options.orders).filter((order) =>
      selectedIds.has(orderId(order.id))
    )
  })
  const canAct = computed(
    () =>
      toValue(options.canOperate) &&
      selectedOrders.value.length > 0 &&
      !sending.value &&
      !selectedOrders.value.some((order) =>
        options.isTransitioning(orderId(order.id))
      )
  )

  watch(
    () => toValue(options.orders).map((order) => orderId(order.id)),
    (currentOrderIds: string[]) => {
      const currentIds = new Set(currentOrderIds)
      selectedOrderIds.value = selectedOrderIds.value.filter((id: string) =>
        currentIds.has(id)
      )
    }
  )

  function isSelected(value: unknown) {
    return selectedOrderIds.value.includes(orderId(value))
  }

  function toggle(value: unknown) {
    const id = orderId(value)
    if (!toValue(options.canOperate) || !id || options.isTransitioning(id))
      return

    selectedOrderIds.value = isSelected(id)
      ? selectedOrderIds.value.filter((selectedId: string) => selectedId !== id)
      : [...selectedOrderIds.value, id]
  }

  async function send() {
    if (!canAct.value) return

    sending.value = true
    try {
      await transitionSelected(options.completeOrder)
    } finally {
      sending.value = false
    }
  }

  async function transitionSelected(
    transition: (selectedOrderId: string) => Promise<unknown>
  ) {
    const ids = selectedOrders.value.map((order) => orderId(order.id))
    const results = await Promise.allSettled(ids.map(transition))
    const failedIds = new Set(
      ids.filter((_, index) => results[index]?.status === 'rejected')
    )
    selectedOrderIds.value = selectedOrderIds.value.filter(
      (id: string) => !ids.includes(id) || failedIds.has(id)
    )
  }

  return {
    canSend: canAct,
    isSelected,
    selectedOrders,
    send,
    sending,
    toggle,
  }
}
