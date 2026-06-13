import { computed, isRef } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useSupplierCollection,
  type SupplierCollectionFilter,
} from '../../../firestore/supplier/fetch/useSupplierCollection'
import { type SupplierSurface } from '../../../firestore/supplier/utils/view/useSupplierInterface'
import { SupplierStorage } from '../../../../../models/supplier/Supplier.model'
import type { Ref } from 'vue'

type UseSupplierConsoleOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Supplier.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-suppliers/docs/contract.md
 *
 * This file adapts Supplier root/app authority sources into the private /console/supplier selected runtime.
 * It should not own Supplier catalogue or product operation records; those live under console/supplier/operations.
 */
export function useSupplierConsole(
  options: UseSupplierConsoleOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<SupplierCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    if (Array.isArray(explicitFilter.ids)) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { suppliers: targetSuppliers, pending: targetsPending } = useSupplierCollection({
    filter: targetFilter,
  })

  const {
    selectedTarget,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<SupplierSurface>('supplier', {
    targetItems: targetSuppliers,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
  })

  const selectedSupplier = computed<SupplierSurface | null>(
    () => selectedTarget.value as SupplierSurface | null
  )
  const supplierId = computed(() => normalizeString(selectedSupplier.value?.id))
  const activeSupplierAppId = computed(() =>
    resolveConsoleEntityAppId(selectedSupplier.value, appId)
  )
  const rootCollection = computed(() =>
    SupplierStorage.rootCollection
  )
  const readOnly = computed(() => false)
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedSupplier.value, userId.value)
  )

  const clearSelectedSupplier = () => {
    clearSelection()
  }

  const selectSupplier = (supplierId: string) => {
    selectTarget(supplierId)
  }
  const suppliers = {
    targets: targetSuppliers,
    count: computed(() => targetSuppliers.value.length),
    pending: targetsPending,
  }
  const selection = {
    supplier: selectedSupplier,
    supplierId,
    hasSelection: computed(() => Boolean(supplierId.value)),
  }
  const runtime = {
    appId: activeSupplierAppId,
    rootCollection,
    readOnly,
    canWrite,
  }
  const actions = {
    selectSupplier,
    clearSelectedSupplier,
  }

  return {
    suppliers,
    selection,
    runtime,
    actions,
  }
}
