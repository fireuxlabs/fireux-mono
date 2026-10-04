import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenAccess } from '../useKitchenAccess'
import type { KitchenOrderTransition } from '../../utils/order.ts'

type KitchenOrderTransitionOptions = {
  estimatedMinutes?: number | null
  note?: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderTransition(options: {
  appId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()
  const { selectedId } = useWorkspace('kitchen')
  const { appUser } = useUserSession()
  const access = useKitchenAccess()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const error = ref('')
  const pendingByOrderId = ref<Record<string, boolean>>({})
  const pendingCount = computed(
    () => Object.values(pendingByOrderId.value).filter(Boolean).length
  )

  const sources = [() => currentUser.value?.uid, () => toValue(options.appId),
    () => selectedId.value, () => JSON.stringify(appUser.value),
    () => JSON.stringify(access.ids.value), () => access.outcome.value]
  const captureIntent = useCommandScope(sources)
  watch(sources, () => { pendingByOrderId.value = {}; error.value = '' }, { flush: 'sync' })

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
    if (isTransitioning(resolvedOrderId)) throw new Error('This Order already has a pending transition.')
    const isCurrent = captureIntent()
    const body = { app_id: appId, kitchen_id: resolvedKitchenId, order_id: resolvedOrderId, transition,
      ...(transitionOptions.estimatedMinutes !== undefined ? { estimated_minutes: transitionOptions.estimatedMinutes } : {}),
      ...(text(transitionOptions.note) ? { note: text(transitionOptions.note) } : {}),
    }

    error.value = ''
    if (resolvedOrderId) setPending(resolvedOrderId, true)
    try {
      if (!appId) throw new Error('App id is required.')
      if (!resolvedKitchenId) throw new Error('Kitchen id is required.')
      if (!resolvedOrderId) throw new Error('Order id is required.')

      const user = currentUser.value
      const token = await user?.getIdToken()
      if (!token) throw new Error('Sign in before processing kitchen orders.')
      if (!isCurrent() || currentUser.value?.uid !== user?.uid)
        throw new Error('The signed-in account changed before the order could update.')
      requireWritableData()
      if (!['ready', 'empty'].includes(access.outcome.value) || !access.ids.value.includes(resolvedKitchenId)) throw new Error('Current Kitchen association is required.')
      if (
        text(toValue(options.appId)) !== appId ||
        text(selectedId.value) !== resolvedKitchenId
      ) {
        throw new Error(
          'The selected Kitchen changed before the order could update.'
        )
      }

      const result = await $fetch<{ ok: boolean; app_id: string; kitchen_id: string; order: { id: string; status: string } }>('/api/workspace/kitchen/orders/transition', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body, retry: 0,
      })
      if (result?.ok !== true || result.app_id !== appId || result.kitchen_id !== resolvedKitchenId || result.order?.id !== resolvedOrderId || !text(result.order?.status))
        throw new Error('Order response did not match the requested Kitchen and Order.')
      return result
    } catch (transitionError) {
      if (isCurrent()) error.value = transitionErrorMessage(transitionError)
      throw transitionError
    } finally {
      if (isCurrent() && resolvedOrderId) setPending(resolvedOrderId, false)
    }
  }

  return {
    captureIntent,
    error,
    isTransitioning,
    pendingCount,
    transitionKitchenOrder,
  }
}

function transitionErrorMessage(error: unknown) {
  const source =
    error && typeof error === 'object'
      ? (error as {
          data?: { statusMessage?: unknown }
          message?: unknown
          statusMessage?: unknown
        })
      : {}

  return (
    text(
      source.data?.statusMessage || source.statusMessage || source.message
    ) || 'The order could not be updated.'
  )
}
