// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: validate persisted selection from authoritative target outcomes.
import { useCookie, useState } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'
import {
  normalizeConsoleFamily,
  useConsole,
  type ConsoleSource,
} from './useConsole'
import {
  normalizeConsoleDataType,
  type ConsoleDataType,
} from './useConsoleData'
import type { ConsoleTargetOutcome } from './useConsoleIndex'

type ConsoleSelectionState = {
  id?: string
  /** @deprecated Read only for bounded migration to `id`. */
  selectedId?: string
  type?: ConsoleDataType
}

type ValueRef<T> = T | Ref<T> | ComputedRef<T>

export type UseConsoleSelectionOptions<TTarget> = {
  targetItems: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetOutcome: ValueRef<ConsoleTargetOutcome>
  getId: (item: TTarget) => string
  getType?: (item: TTarget) => ConsoleDataType
  enforcedTargetId?: ValueRef<string | null | undefined>
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useConsoleSelection<TTarget = never>(
  family: string,
  options?: UseConsoleSelectionOptions<TTarget>
) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const consoleRoot = useConsole(normalizedFamily)
  const appScope = normalizeConsoleFamily(consoleRoot.appId) || 'app'
  // Keep selection unset until there is a real target; tenant auto-select should
  // not write an empty cookie before writing the resolved target.
  const stateCookie = useCookie<ConsoleSelectionState | null>(
    `fireux-console-${appScope}-${normalizedFamily}`,
    {
      sameSite: 'lax',
    }
  )
  const state = useState<ConsoleSelectionState | null>(
    `fireux-console-${appScope}-${normalizedFamily}-selection-state`,
    () => stateCookie.value ?? null
  )
  // Commit shared session state and persistence together. `useCookie()` refs
  // are local to each composable instance, so watcher-based synchronization can
  // lag behind navigation into a selection-gated route.
  const commitSelection = (value: ConsoleSelectionState | null) => {
    state.value = value
    stateCookie.value = value
  }
  const selectedId = computed(() =>
    normalizeString(state.value?.id ?? state.value?.selectedId)
  )
  const selectedType = computed<ConsoleDataType | null>(() =>
    normalizeConsoleDataType(state.value?.type)
  )
  const targetItems = computed<TTarget[]>(() => {
    const items = options ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetOutcome = computed<ConsoleTargetOutcome>(() =>
    options ? unref(options.targetOutcome) : 'idle'
  )

  const selectTarget = (id: string, type: ConsoleSource = 'live') => {
    const nextId = normalizeString(id)
    if (!nextId) {
      clearSelection()
      return
    }

    const nextType = normalizeConsoleDataType(type) ?? 'live'
    consoleRoot.setSource(nextType)
    commitSelection({
      id: nextId,
      type: nextType,
    })
  }

  const clearSelection = () => {
    commitSelection(null)
    consoleRoot.resetSource()
  }

  const getTargetId = (item: TTarget | null | undefined) => {
    if (!item || !options) return ''
    return normalizeString(options.getId(item))
  }
  const getTargetType = (item: TTarget | null | undefined) =>
    item && options?.getType ? options.getType(item) : null

  const selectedTarget = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options) return null

    return (
      targetItems.value.find(
        (item) =>
          getTargetId(item) === id &&
          (!options.getType || getTargetType(item) === selectedType.value)
      ) ?? null
    )
  })

  // Selection owns only typed workspace state. Target readers may resolve that
  // state, but they never clear or rewrite it as their loading outcome changes.
  watch(
    selectedType,
    (type: ConsoleDataType | null) => {
      if (type && consoleRoot.source.value !== type) {
        consoleRoot.setSource(type)
      }
    },
    { immediate: true }
  )

  if (options?.enforcedTargetId) {
    // A family policy may explicitly commit one authority-proven target. This
    // is the only target-outcome-driven selection mutation.
    watch(
      () => ({
        enforcedId: normalizeString(unref(options.enforcedTargetId)),
        items: targetItems.value,
        outcome: targetOutcome.value,
        currentId: selectedId.value,
        currentType: selectedType.value,
      }),
      ({ enforcedId, items, outcome, currentId, currentType }: {
        enforcedId: string
        items: TTarget[]
        outcome: ConsoleTargetOutcome
        currentId: string
        currentType: ConsoleDataType | null
      }) => {
        const enforcedTarget =
          outcome === 'ready' && enforcedId
            ? items.find((item) => getTargetId(item) === enforcedId)
            : null
        if (!enforcedTarget) return

        const type = getTargetType(enforcedTarget) ?? 'live'
        if (currentId !== enforcedId || currentType !== type) {
          selectTarget(enforcedId, type)
        }
      },
      { immediate: true }
    )
  }

  return {
    family: normalizedFamily,
    source: consoleRoot.source,
    selectedId,
    selectedType,
    selectedTarget,
    selectTarget,
    clearSelection,
  }
}
