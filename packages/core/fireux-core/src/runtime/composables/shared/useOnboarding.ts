// Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: add domain-free staged onboarding mechanics.
import {
  onScopeDispose,
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export type OnboardingValidationResult =
  | boolean
  | string
  | void
  | {
      valid: boolean
      message?: string
    }

export type OnboardingStep<TId extends string> = {
  id: TId
  label: string
  description?: string
  icon?: string
  validate?: () =>
    | OnboardingValidationResult
    | Promise<OnboardingValidationResult>
}

export type UseOnboardingOptions<TId extends string> = {
  steps: MaybeRefOrGetter<readonly OnboardingStep<TId>[]>
  initialStepId?: TId
  onFinish?: () => boolean | void | Promise<boolean | void>
}

const messageFromError = (error: unknown) =>
  error instanceof Error && error.message.trim()
    ? error.message.trim()
    : 'Unable to continue.'

function validationMessage(result: OnboardingValidationResult) {
  if (result === false) return 'Complete this step before continuing.'
  if (typeof result === 'string') return result.trim()
  if (result && typeof result === 'object' && !result.valid) {
    return result.message?.trim() || 'Complete this step before continuing.'
  }
  return ''
}

/**
 * Shared onboarding mechanics. Domain adapters own drafts, validation rules,
 * persistence, copy, and completion routes.
 */
export function useOnboarding<TId extends string>(
  options: UseOnboardingOptions<TId>
) {
  const steps = computed(() => {
    const seen = new Set<TId>()
    return toValue(options.steps).filter((step) => {
      if (!step.id || seen.has(step.id)) return false
      seen.add(step.id)
      return true
    })
  })
  const activeStepId = ref<TId | null>(
    options.initialStepId ?? null
  ) as Ref<TId | null>
  const completedStepIds = ref<TId[]>([]) as Ref<TId[]>
  const visitedStepIds = ref<TId[]>([]) as Ref<TId[]>
  const pending = ref(false)
  const error = ref('')
  const finished = ref(false)
  let intent = 0
  onScopeDispose(() => { intent += 1 })

  const activeStepIndex = computed(() => {
    const index = steps.value.findIndex(
      (step) => step.id === activeStepId.value
    )
    return index >= 0 ? index : 0
  })
  const currentStep = computed(() => steps.value[activeStepIndex.value] ?? null)
  const stepNumber = computed(() =>
    steps.value.length ? activeStepIndex.value + 1 : 0
  )
  const stepCount = computed(() => steps.value.length)
  const progress = computed(() =>
    stepCount.value ? Math.round((stepNumber.value / stepCount.value) * 100) : 0
  )
  const isFirstStep = computed(() => activeStepIndex.value <= 0)
  const isLastStep = computed(
    () => stepCount.value > 0 && activeStepIndex.value === stepCount.value - 1
  )

  function visit(id: TId) {
    if (!visitedStepIds.value.includes(id)) {
      visitedStepIds.value = [...visitedStepIds.value, id]
    }
  }

  function complete(id: TId) {
    if (!completedStepIds.value.includes(id)) {
      completedStepIds.value = [...completedStepIds.value, id]
    }
  }

  function canGoTo(id: TId) {
    const targetIndex = steps.value.findIndex((step) => step.id === id)
    if (targetIndex < 0) return false
    if (targetIndex <= activeStepIndex.value) return true
    return steps.value
      .slice(0, targetIndex)
      .every((step) => completedStepIds.value.includes(step.id))
  }

  function goTo(id: TId) {
    if (pending.value || !canGoTo(id)) return false
    activeStepId.value = id
    visit(id)
    error.value = ''
    return true
  }

  function back() {
    if (pending.value || isFirstStep.value) return false
    const previous = steps.value[activeStepIndex.value - 1]
    return previous ? goTo(previous.id) : false
  }

  async function next() {
    if (pending.value || finished.value || !currentStep.value) return false

    const captured = intent
    const step = currentStep.value
    const current = () => captured === intent
    pending.value = true
    error.value = ''
    try {
      const validation = await step.validate?.()
      if (!current()) return false
      const message = validationMessage(validation)
      if (message) {
        error.value = message
        return false
      }

      complete(step.id)
      if (isLastStep.value) {
        const completed = await options.onFinish?.()
        if (!current() || completed === false) return false
        finished.value = true
        return true
      }

      const following = steps.value[activeStepIndex.value + 1]
      if (!following) return false
      activeStepId.value = following.id
      visit(following.id)
      return true
    } catch (cause) {
      if (current()) error.value = messageFromError(cause)
      return false
    } finally {
      if (current()) pending.value = false
    }
  }

  function invalidateFrom(id: TId) {
    intent += 1
    pending.value = false
    const index = steps.value.findIndex((step) => step.id === id)
    if (index < 0) return
    const retained = new Set(steps.value.slice(0, index).map((step) => step.id))
    completedStepIds.value = completedStepIds.value.filter((stepId) =>
      retained.has(stepId)
    )
    finished.value = false
    error.value = ''
  }

  function reset() {
    intent += 1
    const initial = options.initialStepId
    const first = steps.value[0]?.id ?? null
    activeStepId.value =
      initial && steps.value.some((step) => step.id === initial)
        ? initial
        : first
    completedStepIds.value = []
    visitedStepIds.value = activeStepId.value ? [activeStepId.value] : []
    pending.value = false
    error.value = ''
    finished.value = false
  }

  watch(
    steps,
    (availableSteps: readonly OnboardingStep<TId>[]) => {
      if (!availableSteps.length) {
        activeStepId.value = null
        completedStepIds.value = []
        visitedStepIds.value = []
        return
      }

      const ids = new Set(
        availableSteps.map((step: OnboardingStep<TId>) => step.id)
      )
      completedStepIds.value = completedStepIds.value.filter((id) =>
        ids.has(id)
      )
      visitedStepIds.value = visitedStepIds.value.filter((id) => ids.has(id))
      if (!activeStepId.value || !ids.has(activeStepId.value)) {
        const initial = options.initialStepId
        activeStepId.value =
          initial && ids.has(initial)
            ? initial
            : (availableSteps[0]?.id ?? null)
      }
      if (activeStepId.value) visit(activeStepId.value)
    },
    { immediate: true }
  )

  return {
    activeStepId,
    activeStepIndex,
    back,
    canGoTo,
    completedStepIds,
    currentStep,
    error,
    finished,
    goTo,
    invalidateFrom,
    isFirstStep,
    isLastStep,
    next,
    pending,
    progress,
    reset,
    stepCount,
    stepNumber,
    steps,
    visitedStepIds,
  }
}
