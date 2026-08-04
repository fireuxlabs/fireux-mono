// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: validate persisted selection from authoritative target outcomes.
import { useCookie } from '#imports'
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

type ValueRef<T> = Ref<T> | ComputedRef<T>

export type UseConsoleSelectionOptions<TTarget> = {
  targetItems: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetOutcome: ValueRef<ConsoleTargetOutcome>
  getId: (item: TTarget) => string
  getType?: (item: TTarget) => ConsoleDataType
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useConsoleSelection<TTarget = never>(
  family: string,
  options?: UseConsoleSelectionOptions<TTarget>
) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const consoleRoot = useConsole(normalizedFamily)
  // Keep selection unset until there is a real target; tenant auto-select should
  // not write an empty cookie before writing the resolved target.
  const state = useCookie<ConsoleSelectionState | null>(
    `fireux-console-${normalizedFamily}`,
    {
      sameSite: 'lax',
    }
  )
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
    state.value = {
      id: nextId,
      type: nextType,
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

  // Legacy selections used `selectedId` and could omit type. Canonicalize them
  // once without deriving authority from the separate source cookie. A former
  // Demo id that is not present in Live is then cleared by the target outcome.
  watch(
    () => ({
      id: selectedId.value,
      type: selectedType.value,
      canonicalId: normalizeString(state.value?.id),
    }),
    ({
      id,
      type,
      canonicalId,
    }: {
      id: string
      type: ConsoleDataType | null
      canonicalId: string
    }) => {
      if (!id || (canonicalId === id && type)) return
      state.value = {
        id,
        type: type ?? 'live',
      }
    },
    { immediate: true }
  )

  if (options) {
    watch(
      () => ({
        id: selectedId.value,
        type: selectedType.value,
        items: targetItems.value,
        outcome: targetOutcome.value,
      }),
      (state: {
        id: string
        type: ConsoleDataType | null
        items: TTarget[]
        outcome: ConsoleTargetOutcome
      }) => {
        const { id, type, items, outcome } = state
        if (!id || (outcome !== 'ready' && outcome !== 'empty')) return
        if (
          items.some(
            (item) =>
              getTargetId(item) === id &&
              (!options.getType || getTargetType(item) === type)
          )
        )
          return
        clearSelection()
      },
      { immediate: true }
    )
  }
  watch(
    () => ({
      id: selectedId.value,
      type: selectedType.value,
    }),
    ({ id, type }: { id: string; type: ConsoleDataType | null }) => {
      if (!id || !type || consoleRoot.source.value === type) return
      consoleRoot.setSource(type)
    },
    { immediate: true }
  )

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
