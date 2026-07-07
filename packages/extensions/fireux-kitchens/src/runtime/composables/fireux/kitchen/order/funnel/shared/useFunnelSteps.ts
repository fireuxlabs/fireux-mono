import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../../models/kitchen/menu/menu-ordering.model'

type UseFunnelStepsOptions = {
  close: () => void
  stepCount: MaybeRefOrGetter<number>
}

export function useFunnelSteps(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  options: UseFunnelStepsOptions
) {
  const step = ref(1)
  const screenReady = ref(true)
  const currentOrder = computed(() => toValue(order))
  const stepCount = computed(() => Math.max(1, Number(toValue(options.stepCount)) || 1))
  const isFirstStep = computed(() => step.value === 1)
  const isLastStep = computed(() => step.value >= stepCount.value)
  const continueDisabled = computed(() =>
    currentOrder.value.pending || !screenReady.value
  )

  function goBack() {
    step.value = Math.max(1, step.value - 1)
  }

  function goNext() {
    if (continueDisabled.value) return
    if (isLastStep.value) {
      options.close()
      return
    }

    step.value = Math.min(stepCount.value, step.value + 1)
  }

  function reset() {
    step.value = 1
    screenReady.value = true
  }

  function setScreenReady(value: boolean) {
    screenReady.value = value
  }

  watch(step, () => {
    screenReady.value = true
  })

  watch(() => currentOrder.value.quantity, (quantity: number) => {
    if (quantity) return

    reset()
  })

  watch(() => currentOrder.value.orderType, () => {
    reset()
  })

  return {
    continueDisabled,
    goBack,
    goNext,
    isFirstStep,
    isLastStep,
    screenReady,
    setScreenReady,
    step,
    stepCount,
  }
}
