// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: validate persisted selection from authoritative target outcomes.
import { useCookie } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'
import {
  normalizeConsoleFamily,
  useConsole,
  type ConsoleSource,
} from './useConsole'
import type { ConsoleTargetOutcome } from './useConsoleIndex'

type ConsoleSelectionState = {
  selectedId: string
}

type ValueRef<T> = Ref<T> | ComputedRef<T>

export type UseConsoleSelectionOptions<TTarget> = {
  targetItems: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetOutcome: ValueRef<ConsoleTargetOutcome>
  getId: (item: TTarget) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useConsoleSelection<TTarget = never>(
  family: string,
  options?: UseConsoleSelectionOptions<TTarget>
) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const consoleRoot = useConsole(normalizedFamily)
  // Keep selection unset until there is a real target; tenant auto-select should
  // not write an empty cookie before writing the configured target.
  const state = useCookie<ConsoleSelectionState | null>(
    `fireux-console-${normalizedFamily}`,
    {
      sameSite: 'lax',
    }
  )
  const selectedId = computed(() => normalizeString(state.value?.selectedId))
  const targetItems = computed<TTarget[]>(() => {
    const items = options ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetOutcome = computed<ConsoleTargetOutcome>(() =>
    options ? unref(options.targetOutcome) : 'idle'
  )

  const selectTarget = (
    id: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    const nextId = normalizeString(id)
    if (!nextId) {
      clearSelection()
      return
    }

    consoleRoot.setSource(source)
    state.value = {
      selectedId: nextId,
    }
  }

  const clearSelection = () => {
    state.value = null
    consoleRoot.resetSource()
  }

  const getTargetId = (item: TTarget | null | undefined) => {
    if (!item || !options) return ''
    return normalizeString(options.getId(item))
  }

  const selectedTarget = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options) return null

    return targetItems.value.find((item) => getTargetId(item) === id) ?? null
  })

  if (options) {
    watch(
      () => ({
        id: selectedId.value,
        items: targetItems.value,
        outcome: targetOutcome.value,
      }),
      (state: {
        id: string
        items: TTarget[]
        outcome: ConsoleTargetOutcome
      }) => {
        const { id, items, outcome } = state
        if (!id || (outcome !== 'ready' && outcome !== 'empty')) return
        if (items.some((item) => getTargetId(item) === id)) return
        clearSelection()
      },
      { immediate: true }
    )
  }

  return {
    family: normalizedFamily,
    source: consoleRoot.source,
    selectedId,
    selectedTarget,
    selectTarget,
    clearSelection,
  }
}
