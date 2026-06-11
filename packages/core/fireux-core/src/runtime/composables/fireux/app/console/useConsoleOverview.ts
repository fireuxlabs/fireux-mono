import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeConsoleString } from './useConsole'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOverviewOptions<T> = {
  selectedEntity: MaybeRef<T | null | undefined>
  targetItems: MaybeRef<(T | null | undefined)[] | null | undefined>
  getId: (item: T) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useConsoleOverview<T>(
  options: UseConsoleOverviewOptions<T>
) {
  const focus = computed(() => {
    const entity = unref(options.selectedEntity) ?? null

    return {
      entity,
      id: entity ? normalizeConsoleString(options.getId(entity)) : '',
      hasSelection: Boolean(entity),
    }
  })

  const multipleItems = computed<T[]>(() => {
    const items = unref(options.targetItems)

    return Array.isArray(items) ? items.filter(isPresent) : []
  })

  const multiple = computed(() => ({
    items: multipleItems.value,
    count: multipleItems.value.length,
    hasItems: multipleItems.value.length > 0,
  }))

  return {
    focus,
    multiple,
  }
}
