import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../models/menu/menu-ordering.model'

export function useFunnelDispatch(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const stages = computed(() => {
    const orderType = toValue(order).orderType
    if (orderType !== 'delivery') {
      return [
        'Send the request to the kitchen.',
        'Confirm the kitchen timing.',
        'Move to payment once the timing is clear.',
      ]
    }

    return [
      'Send a request to the kitchen.',
      'Send a weak ping to available drivers.',
      'Match kitchen timing with driver timing before payment.',
    ]
  })

  return {
    stages,
  }
}
