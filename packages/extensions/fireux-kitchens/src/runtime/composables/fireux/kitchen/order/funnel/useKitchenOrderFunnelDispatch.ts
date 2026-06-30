import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { doc } from 'firebase/firestore'
import {
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../../models/kitchen/menu/menu-ordering.model'

type DispatchOrder = {
  id?: string
  driver_responses?: Record<string, {
    status?: string
  }>
}

export function useKitchenOrderFunnelDispatch(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  delivery: MaybeRefOrGetter<MenuOrderingDeliveryState | null | undefined>,
  orderPath?: MaybeRefOrGetter<string | null | undefined>
) {
  const db = useFirestore()
  const resolvedOrderPath = computed(() => text(toValue(orderPath)))
  const orderRef = computed(() =>
    resolvedOrderPath.value ? doc(db, resolvedOrderPath.value) : null
  )
  const { data: activeOrder } = useDocument(orderRef, {
    ssrKey: computed(() =>
      resolvedOrderPath.value
        ? `menu-dispatch-order-${resolvedOrderPath.value}`
        : undefined
    ),
    transform: (docSnap: any) => {
      if (!docSnap?.exists?.()) return undefined
      return { id: docSnap.id, ...(docSnap.data() ?? {}) } as DispatchOrder
    },
  } as any)
  const activeDriverResponses = computed(() =>
    ((activeOrder.value as DispatchOrder | undefined)?.driver_responses || {})
  )
  const watchingCount = computed(() =>
    Object.values(activeDriverResponses.value)
      .filter((response) => text(response?.status) === 'watching')
      .length
  )
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
      return 'Driver watching is only needed for delivery orders.'
    }
    if (!toValue(delivery)?.ready) {
      return 'Waiting for a checked delivery address.'
    }
    if (!resolvedOrderPath.value) return 'Waiting for the order to be created.'
    if (watchingCount.value > 0) {
      return `${watchingCount.value} driver${watchingCount.value === 1 ? '' : 's'} watching.`
    }

    return 'Order created. Waiting for drivers to watch.'
  })

  return {
    driverStatus,
    kitchen,
    watchingCount,
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}
