import { toValue, type MaybeRefOrGetter } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenOrderTransition } from '../../../../../../../models/kitchen/order.model'

type KitchenOrderTransitionOptions = {
  estimatedMinutes?: number | null
  note?: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderTransition(options: {
  appId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()

  async function transitionKitchenOrder(
    kitchenId: string,
    orderId: string,
    transition: KitchenOrderTransition,
    transitionOptions: KitchenOrderTransitionOptions = {}
  ) {
    const appId = text(toValue(options.appId))
    const resolvedKitchenId = text(kitchenId)
    const resolvedOrderId = text(orderId)
    if (!appId) throw new Error('App id is required.')
    if (!resolvedKitchenId) throw new Error('Kitchen id is required.')
    if (!resolvedOrderId) throw new Error('Order id is required.')

    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before processing kitchen orders.')

    return $fetch('/api/console/kitchen/orders/transition', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        app_id: appId,
        kitchen_id: resolvedKitchenId,
        order_id: resolvedOrderId,
        transition,
        ...(transitionOptions.estimatedMinutes !== undefined
          ? { estimated_minutes: transitionOptions.estimatedMinutes }
          : {}),
        ...(text(transitionOptions.note)
          ? { note: text(transitionOptions.note) }
          : {}),
      },
    })
  }

  return { transitionKitchenOrder }
}
