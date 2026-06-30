import { computed, unref, type Ref } from 'vue'
import { useOrderFetch } from './fetch/useOrderFetch'
import { useOrderComputed } from './utils/view/useOrderComputed'
import { useOrderInterface } from './utils/view/useOrderInterface'
import { useOrderCreate } from './mutations/useOrderCreate'
import { useOrderUpdate } from './mutations/useOrderUpdate'
import { useOrderDelete } from './mutations/useOrderDelete'

export type {
  Order,
  OrderChannel,
  OrderCreateInput,
  OrderLine,
  OrderScopeType,
  OrderServiceMode,
  OrderStatus,
} from '../../../../models/order.model'
export { useOrderCollection } from './fetch/useOrderCollection'
export { useOrderFetch } from './fetch/useOrderFetch'
export { useOrderCreate } from './mutations/useOrderCreate'
export { useOrderUpdate } from './mutations/useOrderUpdate'
export { useOrderDelete } from './mutations/useOrderDelete'
export { orderCollectionPath, orderPath } from './utils/paths'
export { useOrderComputed } from './utils/view/useOrderComputed'
export { useOrderInterface } from './utils/view/useOrderInterface'

type UseOrderOptions = {
  databaseId?: string | Ref<string | null | undefined>
}

export function useOrder(
  orderId: string | Ref<string | null | undefined>,
  options: UseOrderOptions = {}
) {
  const { order, exists } = useOrderFetch(orderId, options)
  const pending = computed(() =>
    Boolean(String(unref(orderId) || '').trim()) && order.value === undefined
  )

  return {
    order,
    exists,
    ...useOrderComputed(order, pending),
    ...useOrderInterface(),
    ...useOrderCreate(),
    ...useOrderUpdate(options),
    ...useOrderDelete(options),
  }
}
