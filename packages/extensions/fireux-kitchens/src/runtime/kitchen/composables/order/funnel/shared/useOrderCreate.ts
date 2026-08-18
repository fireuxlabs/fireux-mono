import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { CreatedMenuOrder } from '../../../../../menu/models/menu-ordering.model.ts'
import { useOrderIdempotency } from './useOrderIdempotency'
import {
  cleanAddOns,
  cleanCustomer,
  cleanVariant,
  text,
} from './order-input'
import type {
  CreateMenuOrderInput,
  UseMenuOrderCreateOptions,
} from './types'

export function useOrderCreate(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuOrderCreateOptions = {}
) {
  const { currentUser } = useAuth()
  const id = computed(() => text(toValue(menuId)))
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}/orders${qs ? `?${qs}` : ''}`
  })
  const idempotency = useOrderIdempotency(endpoint)
  const creatingItemId = ref('')
  const message = ref('')
  const error = ref('')
  const checkoutPending = ref(false)
  const checkoutMessage = ref('')
  const checkoutError = ref('')

  async function createOrder(input: CreateMenuOrderInput) {
    const items = input.items
      .map((item) => {
        const addOns = cleanAddOns(item.addOns)
        const variant = cleanVariant(item.variant)

        return {
          item_id: text(item.itemId),
          ...(item.menuId ? { menu_id: text(item.menuId) } : {}),
          quantity: Math.max(1, Number(item.quantity || 1) || 1),
          ...(addOns.length ? { add_ons: addOns } : {}),
          ...(variant ? { variant } : {}),
        }
      })
      .filter((item) => item.item_id)
    if (!endpoint.value || !items.length) return null

    creatingItemId.value = 'order'
    message.value = ''
    error.value = ''

    try {
      const body = {
        items,
        channel: input.channel,
        order_type: input.order_type,
        collection: input.collection,
        payment_method: input.payment_method,
        ...(input.requested_for ? { requested_for: input.requested_for } : {}),
        ...(input.room_service ? { room_service: input.room_service } : {}),
        ...(input.table ? { table: input.table } : {}),
        customer: cleanCustomer(input.customer),
      }
      const authToken = await currentUser.value?.getIdToken()
      if (input.channel === 'staff_pos' && !authToken) {
        throw new Error('Sign in before using Staff POS.')
      }
      const idempotencyKey = await idempotency.keyFor(body)
      const created = await $fetch<CreatedMenuOrder>(endpoint.value, {
        method: 'POST',
        ...(authToken
          ? { headers: { Authorization: `Bearer ${authToken}` } }
          : {}),
        body: {
          ...body,
          idempotency_key: idempotencyKey,
        },
      })

      if (created.payment?.required && created.payment.status !== 'paid') {
        message.value = 'Starting secure payment...'
        await createCheckoutSession(created.id)
        idempotency.complete()
        return created
      }

      if (created.status === 'pending_acceptance') {
        message.value = created.order_number
          ? `Order ${created.order_number} sent. Waiting for kitchen acceptance.`
          : 'Order sent. Waiting for kitchen acceptance.'
        idempotency.complete()
        return created
      }

      message.value = created.order_number
        ? `Order ${created.order_number} sent to the kitchen.`
        : 'Order sent to the kitchen.'

      idempotency.complete()
      return created
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      const causeMessage = err instanceof Error ? err.message : ''
      error.value = statusMessage || causeMessage || 'Order could not be sent.'

      return null
    } finally {
      creatingItemId.value = ''
    }
  }

  async function createCheckoutSession(orderId: string) {
    const orderPath = text(orderId)
    if (!id.value || !orderPath) return

    checkoutPending.value = true
    checkoutMessage.value = 'Opening secure payment...'
    checkoutError.value = ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    const qs = query.toString()
    try {
      const response = await $fetch<{ url?: string }>(
        `/api/menus/${encodeURIComponent(id.value)}/orders/${encodeURIComponent(orderPath)}/checkout-session${qs ? `?${qs}` : ''}`,
        { method: 'POST' }
      )
      const checkoutUrl = text(response?.url)
      if (!checkoutUrl) {
        throw new Error('Payment checkout could not be started.')
      }

      checkoutMessage.value = 'Redirecting to Stripe...'
      if (import.meta.client) {
        window.location.href = checkoutUrl
      }
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      checkoutError.value = statusMessage || 'Payment checkout could not be started.'
      throw err
    } finally {
      checkoutPending.value = false
    }
  }

  return {
    checkoutError,
    checkoutMessage,
    checkoutPending,
    createCheckoutSession,
    createOrder,
    creatingItemId,
    error,
    message,
  }
}
