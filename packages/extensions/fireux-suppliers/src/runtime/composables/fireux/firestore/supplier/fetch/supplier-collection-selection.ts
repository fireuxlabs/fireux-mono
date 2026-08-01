import { computed, isRef } from 'vue'
import {
  normalizeString,
  type SupplierCollectionFilter,
  type SupplierCollectionSource,
  type UseSupplierCollectionOptions,
} from './supplier-collection-contract'

export function useSupplierCollectionSelection(
  options: UseSupplierCollectionOptions
) {
  const sourceMode = computed<SupplierCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<SupplierCollectionFilter | undefined>(() => {
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
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalizeString(value))
          .filter(Boolean)
      )
  )
  const usesTargetedRootRead = computed(
    () => hasFilter.value || hasOperatorFilter.value
  )

  return {
    sourceMode,
    hasFilter,
    filterOperatorId,
    hasOperatorFilter,
    filterIdSet,
    usesTargetedRootRead,
  }
}
