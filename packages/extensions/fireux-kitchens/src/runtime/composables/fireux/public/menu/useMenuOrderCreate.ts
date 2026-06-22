import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  KitchenOrderFireState,
  KitchenOrderType,
} from '../../../../models/order.model'

type MenuOrderLineInput = {
  itemId: string
  quantity: number
}

type CreateMenuOrderInput = {
  items: MenuOrderLineInput[]
  order_type?: KitchenOrderType
  requested_for?: string
}

type CreatedMenuOrder = {
  id: string
  order_number: string
  order_type: KitchenOrderType
  fire_state: KitchenOrderFireState
}

type UseMenuOrderCreateOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuOrderCreate(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuOrderCreateOptions = {}
) {
  const id = computed(() => text(toValue(menuId)))
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}/orders${qs ? `?${qs}` : ''}`
  })
  const creatingItemId = ref('')
  const message = ref('')
  const error = ref('')

  const createOrder = async (input: CreateMenuOrderInput) => {
    const items = input.items
      .map((item) => ({
        itemId: text(item.itemId),
        quantity: Math.max(1, Number(item.quantity || 1) || 1),
      }))
      .filter((item) => item.itemId)
    if (!endpoint.value || !items.length) return null

    creatingItemId.value = 'order'
    message.value = ''
    error.value = ''

    try {
      const created = await $fetch<CreatedMenuOrder>(endpoint.value, {
        method: 'POST',
        body: {
          items,
          order_type: input.order_type,
          requested_for: input.requested_for,
        },
      })

      message.value = created.order_number
        ? `Order ${created.order_number} sent to the kitchen.`
        : 'Order sent to the kitchen.'

      return created
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      error.value = statusMessage || 'Order could not be sent.'

      return null
    } finally {
      creatingItemId.value = ''
    }
  }

  return {
    creatingItemId,
    message,
    error,
    createOrder,
  }
}
