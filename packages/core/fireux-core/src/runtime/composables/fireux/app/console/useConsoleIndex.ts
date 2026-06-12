import { computed, unref, type ComputedRef, type Ref } from 'vue'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexDebug = Record<string, unknown>

type UseConsoleIndexOptions<TTarget> = {
  entities: MaybeRef<{
    targets: (TTarget | null | undefined)[] | null | undefined
  }>
  selectEntity: (id: string) => void
  debug?: MaybeRef<ConsoleIndexDebug | null | undefined>
}

export function useConsoleIndex<TTarget>(
  options: UseConsoleIndexOptions<TTarget>
) {
  const targetItems = computed<TTarget[]>(() => {
    const source = unref(options.entities)
    return Array.isArray(source.targets) ? (source.targets as TTarget[]) : []
  })

  const entities = computed(() => ({
    targets: targetItems.value,
  }))
  const counts = computed(() => ({
    targets: targetItems.value.length,
  }))
  const debug = computed(() => ({
    ...(options.debug ? unref(options.debug) ?? {} : {}),
    counts: counts.value,
  }))

  const actions = {
    selectTarget: (id: string) => {
      options.selectEntity(id)
    },
  }

  return {
    entities,
    counts,
    debug,
    actions,
  }
}
