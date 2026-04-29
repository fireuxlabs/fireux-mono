import { useCookie } from '#imports'
import { computed, unref, type ComputedRef, type Ref } from 'vue'

export type ConsoleMode = 'live' | 'demo' | 'test'

type ConsoleState = {
  selectedId: string
  selectedMode: ConsoleMode
}

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseConsoleOptions<TLive, TDemo, TTest> = {
  liveItems?: MaybeRef<(TLive | null | undefined)[] | null | undefined>
  demoItems?: MaybeRef<(TDemo | null | undefined)[] | null | undefined>
  testItem?: MaybeRef<TTest | null | undefined>
  getId?: (item: TLive | TDemo | TTest) => string
}

export const normalizeConsoleString = (value: unknown) =>
  String(value ?? '').trim()

export const resolveConsoleRootCollection = (
  family: string,
  mode: ConsoleMode
) => {
  const normalizedFamily = normalizeConsoleString(family)
  if (!normalizedFamily || mode === 'demo') return ''
  if (mode === 'test') return `test-${normalizedFamily}`
  return normalizedFamily
}

export const resolveConsoleCanWrite = (mode: ConsoleMode) => mode !== 'demo'

export const resolveConsoleModeLabel = (mode: ConsoleMode) =>
  mode === 'demo' ? 'Demo' : mode === 'test' ? 'Test' : 'Live'

const normalizeFamily = normalizeConsoleString
const normalizeString = normalizeConsoleString
const isPresent = <T>(value: T | null | undefined): value is T => value != null
const isConsoleMode = (value: unknown): value is ConsoleMode =>
  value === 'live' || value === 'demo' || value === 'test'
const defaultConsoleState = (): ConsoleState => ({
  selectedId: '',
  selectedMode: 'live',
})

export function useConsole<TLive = never, TDemo = never, TTest = never>(
  family: string,
  options?: UseConsoleOptions<TLive, TDemo, TTest>
) {
  const normalizedFamily = normalizeFamily(family)
  const state = useCookie<ConsoleState>(`fireux-console-${normalizedFamily}`, {
    default: defaultConsoleState,
    sameSite: 'lax',
  })

  const selectedId = computed(() => normalizeString(state.value?.selectedId))
  const selectedMode = computed<ConsoleMode>(() =>
    isConsoleMode(state.value?.selectedMode) ? state.value.selectedMode : 'live'
  )
  const liveItems = computed<TLive[]>(() => {
    const items = options?.liveItems ? unref(options.liveItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const demoItems = computed<TDemo[]>(() => {
    const items = options?.demoItems ? unref(options.demoItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const testItem = computed<TTest | null>(() => {
    const item = options?.testItem ? unref(options.testItem) : null
    return item ?? null
  })

  const selectEntity = (id: string, mode: ConsoleMode = selectedMode.value) => {
    state.value = {
      selectedId: normalizeString(id),
      selectedMode: mode,
    }
  }

  const clearSelection = () => {
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  const getEntityId = (item: TLive | TDemo | TTest | null | undefined) => {
    if (!item || !options?.getId) return ''
    return normalizeString(options.getId(item))
  }

  const selectedEntity = computed<TLive | TDemo | TTest | null>(() => {
    const id = selectedId.value
    if (!id || !options?.getId) return null

    if (selectedMode.value === 'demo') {
      return demoItems.value.find((item) => getEntityId(item) === id) ?? null
    }

    if (selectedMode.value === 'test') {
      const item = testItem.value
      return getEntityId(item) === id ? item : null
    }

    return liveItems.value.find((item) => getEntityId(item) === id) ?? null
  })

  return {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  }
}
