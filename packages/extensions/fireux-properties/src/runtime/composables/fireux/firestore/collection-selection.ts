import { computed, isRef, type Ref } from 'vue'

export type TargetCollectionFilterValue = string | number | null | undefined
export type TargetCollectionFilter = {
  ids?: TargetCollectionFilterValue[] | null | undefined
  operatorId?: TargetCollectionFilterValue
  teamId?: TargetCollectionFilterValue
}
type TargetCollectionSelectionOptions<
  TSource extends string,
  TFilter extends TargetCollectionFilter,
> = {
  source?: TSource | Ref<TSource | null | undefined> | null
  filter?: TFilter | Ref<TFilter | null | undefined> | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTargetCollectionSelection<
  TSource extends string,
  TFilter extends TargetCollectionFilter,
>(
  options: TargetCollectionSelectionOptions<TSource, TFilter>,
  defaultSource: TSource
) {
  const sourceMode = computed<TSource>(() => {
    if (isRef(options.source)) return options.source.value ?? defaultSource
    return options.source ?? defaultSource
  })
  const resolvedFilter = computed<TFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterOperatorId = computed(() =>
    normalizeString(
      resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId
    )
  )
  const hasOperatorFilter = computed(
    () =>
      Object.prototype.hasOwnProperty.call(
        resolvedFilter.value ?? {},
        'operatorId'
      ) ||
      Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? []).map(normalizeString).filter(Boolean)
      )
  )

  return {
    sourceMode,
    hasFilter,
    filterOperatorId,
    hasOperatorFilter,
    filterIdSet,
  }
}
