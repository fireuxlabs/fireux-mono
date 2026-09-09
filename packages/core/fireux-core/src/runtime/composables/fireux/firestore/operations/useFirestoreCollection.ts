import { computed, isRef, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

export type FirestoreCollectionSource = 'live' | 'test' | 'demo'
export type FirestoreCollectionOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'
export type FirestoreCollectionFilterValue = string | number | null | undefined
type FirestoreCollectionFilterInput =
  | FirestoreCollectionFilterValue[]
  | null
  | undefined

export type FirestoreCollectionOptions = {
  source?: FirestoreCollectionSource | Ref<FirestoreCollectionSource>
  filter?: FirestoreCollectionFilterInput | Ref<FirestoreCollectionFilterInput>
}

type UseFirestoreCollectionModesOptions = {
  source?: FirestoreCollectionSource | Ref<FirestoreCollectionSource>
  defaultCollectionPath: string
  testCollectionPath: string
}

type UseFirestoreCollectionStateOptions = {
  active?: MaybeRefOrGetter<boolean>
  count: MaybeRefOrGetter<number>
  error: MaybeRefOrGetter<unknown | undefined>
  pending: MaybeRefOrGetter<boolean>
}

export function useFirestoreCollectionState(
  options: UseFirestoreCollectionStateOptions
) {
  const outcome = computed<FirestoreCollectionOutcome>(() => {
    if (options.active !== undefined && !toValue(options.active)) return 'idle'
    if (toValue(options.pending)) return 'pending'
    if (toValue(options.error)) return 'error'
    return toValue(options.count) > 0 ? 'ready' : 'empty'
  })

  return {
    outcome,
  }
}

export function resolveFirestoreCollectionOption<T>(
  value: T | Ref<T> | undefined,
  fallback: T
): T {
  if (isRef(value)) return value.value
  return value ?? fallback
}

export function useFirestoreCollectionModes(
  options: UseFirestoreCollectionModesOptions
) {
  const sourceMode = computed<FirestoreCollectionSource>(() =>
    resolveFirestoreCollectionOption(options.source, 'live')
  )
  const collectionPath = computed(() =>
    sourceMode.value === 'test'
      ? options.testCollectionPath
      : options.defaultCollectionPath
  )

  return {
    sourceMode,
    collectionPath,
  }
}

export function useFirestoreCollectionFilter(
  filter?: FirestoreCollectionFilterInput | Ref<FirestoreCollectionFilterInput>
) {
  const resolvedFilter = computed<FirestoreCollectionFilterInput>(() =>
    resolveFirestoreCollectionOption(filter, undefined)
  )
  const filterIds = computed(() =>
    (resolvedFilter.value ?? [])
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value))
  const filterIdSet = computed(() => new Set(filterIds.value))

  return {
    filterIds,
    hasFilter,
    filterIdSet,
  }
}

export function normalizeFirestoreCollectionItems<
  TInput,
  TOutput extends { id?: string },
>(
  entries: TInput[] | null | undefined,
  mapItem: (entry: TInput) => TOutput | null
): TOutput[] {
  return (entries ?? []).reduce<TOutput[]>((acc, entry) => {
    const item = mapItem(entry)
    if (!item) return acc

    const id = String(item.id || '').trim()
    if (!id) return acc

    acc.push({
      ...item,
      id,
    })

    return acc
  }, [])
}
