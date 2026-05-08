import { computed, unref, type ComputedRef, type Ref } from 'vue'
import {
  normalizeConsoleString,
  type ConsoleMode,
} from './useConsole'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOverviewOptions<TSelected, TGroup> = {
  selectedEntity: MaybeRef<TSelected | null | undefined>
  selectedMode?: MaybeRef<ConsoleMode | null | undefined>
  liveItems: MaybeRef<(TGroup | null | undefined)[] | null | undefined>
  demoItems?: MaybeRef<(TGroup | null | undefined)[] | null | undefined>
  testItem?: MaybeRef<TGroup | null | undefined>
  getId: (item: TSelected | TGroup) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useConsoleOverview<TSelected, TGroup>(
  options: UseConsoleOverviewOptions<TSelected, TGroup>
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

  const groupItems = computed<TGroup[]>(() => {
    const mode = focus.value.mode
    const items =
      mode === 'demo'
        ? unref(options.demoItems)
        : mode === 'test'
          ? [unref(options.testItem)]
          : unref(options.liveItems)

    return Array.isArray(items) ? items.filter(isPresent) : []
  })

  const group = computed(() => ({
    items: groupItems.value,
    count: groupItems.value.length,
    hasItems: groupItems.value.length > 0,
  }))

  return {
    focus,
    group,
  }
}
