import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../../utils/string'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOverviewOptions<T> = {
  selectedEntity: ValueRef<T | null | undefined>
  targetItems: ValueRef<(T | null | undefined)[] | null | undefined>
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
      id: entity ? normalizeString(options.getId(entity)) : '',
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
