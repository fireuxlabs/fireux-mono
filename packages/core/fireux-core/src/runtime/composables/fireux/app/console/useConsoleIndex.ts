import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeConsoleString, type ConsoleMode } from './useConsole'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexDebug = Record<string, unknown>

type UseConsoleIndexOptions<TLive, TDemo, TTest> = {
  entities: MaybeRef<{
    live: (TLive | null | undefined)[] | null | undefined
    demo: (TDemo | null | undefined)[] | null | undefined
    test: TTest | null | undefined
  }>
  selectEntity: (id: string, mode?: ConsoleMode) => void
  getTestId: (item: TTest) => string
  debug?: MaybeRef<ConsoleIndexDebug | null | undefined>
}

export function useConsoleIndex<
  TLive,
  TDemo,
  TTest,
>(options: UseConsoleIndexOptions<TLive, TDemo, TTest>) {
  const liveItems = computed<TLive[]>(() => {
    const source = unref(options.entities)
    return Array.isArray(source.live) ? (source.live as TLive[]) : []
  })

  const demoItems = computed<TDemo[]>(() => {
    const source = unref(options.entities)
    return Array.isArray(source.demo) ? (source.demo as TDemo[]) : []
  })

  const testItem = computed<TTest | null>(() => {
    const value = unref(options.entities).test
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as TTest)
      : null
  })

  const entities = computed(() => ({
    live: liveItems.value,
    demo: demoItems.value,
    test: testItem.value,
  }))
  const counts = computed(() => ({
    live: liveItems.value.length,
    demo: demoItems.value.length,
    test: testItem.value ? 1 : 0,
  }))
  const debug = computed(() => ({
    ...(options.debug ? unref(options.debug) ?? {} : {}),
    counts: counts.value,
  }))

  const actions = {
    selectLive: (id: string) => {
      options.selectEntity(id, 'live')
    },
    selectDemo: (id: string) => {
      options.selectEntity(id, 'demo')
    },
    selectTest: () => {
      const item = testItem.value
      if (!item) return

      const id = normalizeConsoleString(options.getTestId(item))
      if (!id) return

      options.selectEntity(id, 'test')
    },
  }

  return {
    entities,
    counts,
    debug,
    actions,
  }
}
