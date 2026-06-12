import { useCookie } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'

type ConsoleState = {
  selectedId: string
}

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOptions<TTarget> = {
  targetItems?: MaybeRef<(TTarget | null | undefined)[] | null | undefined>
  targetPending?: MaybeRef<boolean | null | undefined>
  getId?: (item: TTarget) => string
}

export const normalizeConsoleString = (value: unknown) =>
  String(value ?? '').trim()

const normalizeFamily = normalizeConsoleString
const normalizeString = normalizeConsoleString
const isPresent = <T>(value: T | null | undefined): value is T => value != null
const defaultConsoleState = (): ConsoleState => ({
  selectedId: '',
})

export function useConsole<TTarget = never>(
  family: string,
  options?: UseConsoleOptions<TTarget>
) {
  const normalizedFamily = normalizeFamily(family)
  const state = useCookie<ConsoleState>(`fireux-console-${normalizedFamily}`, {
    default: defaultConsoleState,
    sameSite: 'lax',
  })

  const selectedId = computed(() => normalizeString(state.value?.selectedId))
  const targetItems = computed<TTarget[]>(() => {
    const items = options?.targetItems ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetPending = computed(() =>
    options?.targetPending ? Boolean(unref(options.targetPending)) : false
  )

  const selectEntity = (id: string) => {
    state.value = {
      selectedId: normalizeString(id),
    }
  }

  const clearSelection = () => {
    state.value = {
      selectedId: '',
    }
  }

  const getEntityId = (item: TTarget | null | undefined) => {
    if (!item || !options?.getId) return ''
    return normalizeString(options.getId(item))
  }

  const selectedEntity = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options?.getId) return null

    return targetItems.value.find((item) => getEntityId(item) === id) ?? null
  })

  if (options?.targetItems && options.getId) {
    watch(
      [selectedId, targetItems, targetPending],
      ([id, items, pending]) => {
        if (!id || pending) return
        if (items.some((item) => getEntityId(item) === id)) return
        clearSelection()
      },
      { immediate: true }
    )
  }

  return {
    selectedId,
    selectedEntity,
    selectEntity,
    clearSelection,
  }
}
