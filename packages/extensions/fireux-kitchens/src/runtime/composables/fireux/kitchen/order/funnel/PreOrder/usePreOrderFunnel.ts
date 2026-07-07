import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

export function usePreOrderFunnel(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const detailsStatus = computed(() =>
    toValue(order).policy?.message ||
    'The kitchen will confirm your pre-order time before payment.'
  )
  const kitchenStatus = computed(() =>
    'Sending the pre-order request for kitchen approval.'
  )
  const timingStatus = computed(() =>
    'The kitchen will confirm the time before payment.'
  )
  const ready = computed(() => true)

  return {
    detailsStatus,
    kitchenStatus,
    ready,
    timingStatus,
  }
}
