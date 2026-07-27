import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
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
  const { selectedId } = useConsoleSelection('kitchen')
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const error = ref('')
  const pendingByOrderId = ref<Record<string, boolean>>({})
  const pendingCount = computed(() =>
    Object.values(pendingByOrderId.value).filter(Boolean).length
  )

  function isTransitioning(orderId: unknown) {
    const resolvedOrderId = text(orderId)
    return Boolean(resolvedOrderId && pendingByOrderId.value[resolvedOrderId])
  }

  function setPending(orderId: string, pending: boolean) {
    const next = { ...pendingByOrderId.value }
    if (pending) next[orderId] = true
    else delete next[orderId]
    pendingByOrderId.value = next
  }

  async function transitionKitchenOrder(
    kitchenId: string,
    orderId: string,
    transition: KitchenOrderTransition,
    transitionOptions: KitchenOrderTransitionOptions = {}
  ) {
    requireWritableData()
    const appId = text(toValue(options.appId))
    const resolvedKitchenId = text(kitchenId)
    const resolvedOrderId = text(orderId)
    if (isTransitioning(resolvedOrderId)) return

    error.value = ''
    if (resolvedOrderId) setPending(resolvedOrderId, true)
    try {
      if (!appId) throw new Error('App id is required.')
      if (!resolvedKitchenId) throw new Error('Kitchen id is required.')
      if (!resolvedOrderId) throw new Error('Order id is required.')

      const token = await currentUser.value?.getIdToken()
      if (!token) throw new Error('Sign in before processing kitchen orders.')
      requireWritableData()
      if (
        text(toValue(options.appId)) !== appId ||
        text(selectedId.value) !== resolvedKitchenId
      ) {
        throw new Error('The selected Kitchen changed before the order could update.')
      }

      return await $fetch('/api/console/kitchen/orders/transition', {
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
    } catch (transitionError) {
      error.value = transitionErrorMessage(transitionError)
      throw transitionError
    } finally {
      if (resolvedOrderId) setPending(resolvedOrderId, false)
    }
  }

  return {
    error,
    isTransitioning,
    pendingCount,
    transitionKitchenOrder,
  }
}

function transitionErrorMessage(error: unknown) {
  const source = error && typeof error === 'object'
    ? error as {
        data?: { statusMessage?: unknown }
        message?: unknown
        statusMessage?: unknown
      }
    : {}

  return text(
    source.data?.statusMessage || source.statusMessage || source.message
  ) || 'The order could not be updated.'
}
