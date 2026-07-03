import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

export function useCollection(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  step: MaybeRefOrGetter<number>
) {
  const allergenAccepted = ref(false)
  const rendezvousReady = ref(false)
  const ready = computed(() => canContinue(Number(toValue(step)) || 1))

  function canContinue(step: number) {
    if (step === 2) return allergenAccepted.value
    if (step === 3) return rendezvousReady.value

    return true
  }

  function reset() {
    allergenAccepted.value = false
    rendezvousReady.value = false
  }

  watch(() => toValue(order).quantity, (quantity: number) => {
    if (quantity) return

    reset()
  })

  watch(() => toValue(order).orderType, () => {
    reset()
  })

  return {
    allergenAccepted,
    canContinue,
    ready,
    rendezvousReady,
  }
}
