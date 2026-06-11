import { computed, unref, type ComputedRef, type Ref } from 'vue'
import {
  normalizeConsoleString,
  type ConsoleMode,
} from './useConsole'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOverviewOptions<T> = {
  selectedEntity: MaybeRef<T | null | undefined>
  selectedMode?: MaybeRef<ConsoleMode | null | undefined>
  liveItems: MaybeRef<(T | null | undefined)[] | null | undefined>
  demoItems?: MaybeRef<(T | null | undefined)[] | null | undefined>
  testItem?: MaybeRef<T | null | undefined>
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
      mode: (options.selectedMode ? unref(options.selectedMode) : 'live') ?? 'live',
      hasSelection: Boolean(entity),
    }
  })

  const multipleItems = computed<T[]>(() => {
    const mode = focus.value.mode
    const items =
      mode === 'demo'
        ? unref(options.demoItems)
        : mode === 'test'
          ? [unref(options.testItem)]
          : unref(options.liveItems)

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
