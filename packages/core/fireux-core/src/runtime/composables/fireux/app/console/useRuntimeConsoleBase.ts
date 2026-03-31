import { computed, type Ref } from 'vue'
import { normalizeString } from '../../runtime/runtime.normalize'

type RuntimeConsoleRuntime = {
  id: Ref<string>
  mode: Ref<string>
  isReadOnly: Ref<boolean | undefined>
}

type RuntimeConsoleBaseOptions<TItem, TScenario, TActive> = {
  runtime: RuntimeConsoleRuntime
  owned: Ref<TItem[] | undefined>
  readOnly: Ref<TScenario[] | undefined>
  canOwnMultiple: Ref<boolean | undefined>
  ownedId: (item: TItem) => string
  readOnlyId: (scenario: TScenario) => string
  ownedItem: (item: TItem) => TActive | null | undefined
  readOnlyItem: (scenario: TScenario) => TActive | null | undefined
}

export function useRuntimeConsoleBase<TItem, TScenario, TActive>(
  options: RuntimeConsoleBaseOptions<TItem, TScenario, TActive>
) {
  const owned = computed(() => options.owned.value ?? [])
  const readOnly = computed(() => options.readOnly.value ?? [])
  const canOwnMultiple = computed(() => Boolean(options.canOwnMultiple.value))
  const currentId = computed(() => normalizeString(options.runtime.id.value))

  const activeItem = computed<TActive | null>(() => {
    if (!currentId.value) return null

    if (options.runtime.isReadOnly.value) {
      const scenario = readOnly.value.find(
        (entry) => normalizeString(options.readOnlyId(entry)) === currentId.value
      )
      return scenario ? options.readOnlyItem(scenario) ?? null : null
    }

    const item = owned.value.find(
      (entry) => normalizeString(options.ownedId(entry)) === currentId.value
    )

    if (!item) return null
    return options.ownedItem(item) ?? null
  })

  const hasActiveItem = computed(() => activeItem.value !== null)

  const canSelectMultipleLive = computed(
    () =>
      options.runtime.mode.value === 'live' &&
      canOwnMultiple.value &&
      owned.value.length > 1
  )

  const canSelectMultipleReadOnly = computed(
    () => options.runtime.isReadOnly.value && readOnly.value.length > 1
  )

  const showSelector = computed(() =>
    options.runtime.isReadOnly.value ? canSelectMultipleReadOnly.value : canSelectMultipleLive.value
  )

  const isOperatorOverview = computed(() => showSelector.value && !hasActiveItem.value)

  return {
    activeItem,
    hasActiveItem,
    canSelectMultipleLive,
    canSelectMultipleReadOnly,
    showSelector,
    isOperatorOverview,
  }
}
