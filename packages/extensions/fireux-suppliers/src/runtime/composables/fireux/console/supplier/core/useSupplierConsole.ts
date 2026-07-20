// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: validate Supplier selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve Supplier demos through the lazy console adapter.
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useSupplierCollection,
  type SupplierCollectionFilter,
} from '../../../firestore/supplier/fetch/useSupplierCollection'
import { type SupplierSurface } from '../../../firestore/supplier/utils/view/useSupplierInterface'
import { SupplierStorage } from '../../../../../models/supplier/Supplier.model'
import { useSupplierConsoleDemoData } from './useSupplierConsoleDemoData'

type ConsoleTargetOutcomeRef =
  | Ref<ConsoleTargetOutcome>
  | ComputedRef<ConsoleTargetOutcome>

type UseSupplierConsoleOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
  resolveTargetOutcome?: (
    sourceOutcome: ConsoleTargetOutcomeRef
  ) => ConsoleTargetOutcomeRef
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
  const sourceCollection = useSupplierCollection({
    source: consoleRoot.source,
    filter: targetFilter,
  })
  const demoData = useSupplierConsoleDemoData(
    computed(() => consoleRoot.source.value === 'demo')
  )
  const targetSuppliers = computed<SupplierSurface[]>(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.data.value?.suppliers ?? []
      : sourceCollection.suppliers.value
  )
  const targetsPending = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.pending.value
      : sourceCollection.pending.value
  )
  const targetsError = computed<unknown | undefined>(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.error.value
      : sourceCollection.error.value
  )
  const sourceTargetsOutcome = computed<ConsoleTargetOutcome>(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.outcome.value
      : sourceCollection.outcome.value
  )
  const membershipAwareTargetsOutcome = options.resolveTargetOutcome
    ? options.resolveTargetOutcome(sourceTargetsOutcome)
    : sourceTargetsOutcome
  const targetsOutcome = computed<ConsoleTargetOutcome>(() =>
    consoleRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useConsoleEntityRuntime<SupplierSurface>({
    family: 'supplier',
    storageFamily: SupplierStorage.rootCollection,
    targetItems: targetSuppliers,
    targetOutcome: targetsOutcome,
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
    error: targetsError,
    outcome: targetsOutcome,
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
