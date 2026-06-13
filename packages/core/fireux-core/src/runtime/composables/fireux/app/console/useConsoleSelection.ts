import { useCookie } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { normalizeConsoleFamily } from './useConsole'

type ConsoleSelectionState = {
  selectedId: string
}

type ValueRef<T> = Ref<T> | ComputedRef<T>

export type UseConsoleSelectionOptions<TTarget> = {
  targetItems?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetPending?: ValueRef<boolean | null | undefined>
  getId?: (item: TTarget) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null
const defaultConsoleSelectionState = (): ConsoleSelectionState => ({
  selectedId: '',
})

export function useConsoleSelection<TTarget = never>(
  family: string,
  options?: UseConsoleSelectionOptions<TTarget>
) {
  const normalizedFamily = normalizeConsoleFamily(family)
  const state = useCookie<ConsoleSelectionState>(
    `fireux-console-${normalizedFamily}`,
    {
      default: defaultConsoleSelectionState,
      sameSite: 'lax',
    }
  )
  const selectedId = computed(() => normalizeString(state.value?.selectedId))
  const targetItems = computed<TTarget[]>(() => {
    const items = options?.targetItems ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetPending = computed(() =>
    options?.targetPending ? Boolean(unref(options.targetPending)) : false
  )

  const selectTarget = (id: string) => {
    state.value = {
      selectedId: normalizeString(id),
    }
  }

  const clearSelection = () => {
    state.value = {
      selectedId: '',
    }
  }

  const getTargetId = (item: TTarget | null | undefined) => {
    if (!item || !options?.getId) return ''
    return normalizeString(options.getId(item))
  }

  const selectedTarget = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options?.getId) return null

    return targetItems.value.find((item) => getTargetId(item) === id) ?? null
  })

  if (options?.targetItems && options.getId) {
    watch(
      () => ({
        id: selectedId.value,
        items: targetItems.value,
        pending: targetPending.value,
      }),
      (state: { id: string; items: TTarget[]; pending: boolean }) => {
        const { id, items, pending } = state
        if (!id || pending) return
        if (!items.length) return
        if (items.some((item) => getTargetId(item) === id)) return
        clearSelection()
      },
      { immediate: true }
    )
  }

  return {
    family: normalizedFamily,
    selectedId,
    selectedTarget,
    selectTarget,
    clearSelection,
  }
}
