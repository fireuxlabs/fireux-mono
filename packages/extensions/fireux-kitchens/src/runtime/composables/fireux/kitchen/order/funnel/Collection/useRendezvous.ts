import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

export function useRendezvous(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const status = computed(() =>
    toValue(order).policy?.message ||
    'The kitchen will confirm your collection time.'
  )

  return {
    ready: computed(() => true),
    status,
  }
}
