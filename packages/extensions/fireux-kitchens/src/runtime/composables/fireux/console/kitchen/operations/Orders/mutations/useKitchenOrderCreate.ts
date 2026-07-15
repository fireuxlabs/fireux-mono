import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  CreatedMenuOrder,
  MenuOrderingSubmitBody,
} from '../../../../../../../models/kitchen/menu/menu-ordering.model'

type CreateKitchenOrderInput = Omit<
  MenuOrderingSubmitBody,
  'channel' | 'idempotency_key'
> & {
  menuId: string
  kitchenSlug: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderCreate() {
  const { currentUser } = useAuth()

  const createOrder = async (input: CreateKitchenOrderInput) => {
    const menuId = text(input.menuId)
    const kitchenSlug = text(input.kitchenSlug)
    if (!menuId) throw new Error('Menu id is required.')
    if (!kitchenSlug) throw new Error('Kitchen slug is required.')
    if (!input.items.length) throw new Error('Order item is required.')

    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before using Staff POS.')

    const query = new URLSearchParams({ kitchenSlug })
    return $fetch<CreatedMenuOrder>(
      `/api/menus/${encodeURIComponent(menuId)}/orders?${query.toString()}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          order_type: input.order_type,
          channel: 'staff_pos',
          items: input.items,
          ...(input.collection ? { collection: input.collection } : {}),
          ...(input.requested_for
            ? { requested_for: input.requested_for }
            : {}),
          ...(input.payment_method
            ? { payment_method: input.payment_method }
            : {}),
          ...(input.customer ? { customer: input.customer } : {}),
          ...(input.table ? { table: input.table } : {}),
          ...(input.room_service
            ? { room_service: input.room_service }
            : {}),
          idempotency_key: crypto.randomUUID(),
        },
      }
    )
  }

  return { createOrder }
}
