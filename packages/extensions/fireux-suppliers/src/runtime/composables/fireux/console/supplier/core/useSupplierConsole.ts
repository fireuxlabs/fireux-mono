import { computed, isRef } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
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
  const consoleRoot = useConsole('supplier')
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<SupplierCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    if (
      consoleRoot.source.value !== 'live' ||
      Array.isArray(explicitFilter.ids)
    ) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { suppliers: targetSuppliers, pending: targetsPending } = useSupplierCollection({
    source: consoleRoot.source,
    filter: targetFilter,
  })

  const entity = useConsoleEntityRuntime<SupplierSurface>({
    family: 'supplier',
    storageFamily: SupplierStorage.rootCollection,
    targetItems: targetSuppliers,
    targetPending: targetsPending,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
    mode: consoleRoot.source,
    userId,
  })

  const selectedSupplier = computed<SupplierSurface | null>(
    () => entity.selection.selectedTarget.value as SupplierSurface | null
  )
  const supplierId = entity.selection.entityId

  const clearSelectedSupplier = () => {
    entity.actions.clearSelection()
  }

  const selectSupplier = (
    supplierId: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    entity.actions.selectTarget(supplierId, source)
  }
  const suppliers = {
    targets: targetSuppliers,
    count: computed(() => targetSuppliers.value.length),
    pending: targetsPending,
  }
  const selection = {
    supplier: selectedSupplier,
    supplierId,
    hasSelection: entity.selection.hasSelection,
  }
  const actions = {
    selectSupplier,
    clearSelectedSupplier,
  }

  return {
    suppliers,
    selection,
    runtime: entity.runtime,
    actions,
  }
}
