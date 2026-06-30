import { computed, type Ref } from 'vue'
import type { Order } from '../../../../../../models/order.model'
import { useOrderInterface } from './useOrderInterface'

export function useOrderComputed(
  order: Ref<Order | null | undefined>,
  pending: Ref<boolean>
) {
  const { card } = useOrderInterface()
  const isPending = computed(() => Boolean(pending.value))
  const orderCard = computed(() => order.value ? card(order.value) : null)
  const orderSearchText = computed(() =>
    orderCard.value ? JSON.stringify(orderCard.value).toLowerCase() : ''
  )

  return {
    isPending,
    orderCard,
    orderSearchText,
  }
}
