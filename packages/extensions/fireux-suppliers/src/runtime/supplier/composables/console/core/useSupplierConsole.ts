// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: validate Supplier selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve Supplier demos through the lazy console adapter.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: make Supplier core own target ids and membership outcome.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { consoleData } from 'fireux-core/runtime/composables/fireux/console/useConsoleData'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/console/useConsoleEntityRuntime'
import { useConsoleFamilyRuntime } from 'fireux-core/runtime/composables/fireux/console/useConsoleFamilyRuntime'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/console/useConsoleTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useSupplierCollection,
} from '../../firestore/fetch/useSupplierCollection'
import { type SupplierSurface } from '../../firestore/utils/view/useSupplierInterface'
import { SupplierStorage } from '../../../models/Supplier.model.ts'
import { useSupplierConsoleDemoData } from './useSupplierConsoleDemoData'

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
function createSupplierConsole() {
  const consoleRoot = useConsole('supplier')
  const consoleTargets = useConsoleTargets({ family: 'supplier' })
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed(() => {
    if (consoleRoot.source.value === 'demo') return {}
    return consoleTargets.filter({
      operatorId: userId.value,
    })
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
  const targetData = computed(() =>
    consoleRoot.source.value === 'demo'
      ? (demoData.data.value?.suppliers ?? []).map(supplier =>
          consoleData('demo', supplier)
        )
      : sourceCollection.suppliers.value.map(supplier =>
          consoleData(
            consoleRoot.source.value === 'test' ? 'test' : 'live',
            supplier
          )
        )
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
  const membershipAwareTargetsOutcome = consoleTargets.resolveOutcome(
    sourceTargetsOutcome
  )
  const targetsOutcome = computed<ConsoleTargetOutcome>(() =>
    consoleRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useConsoleEntityRuntime<SupplierSurface>({
    family: 'supplier',
    storageFamily: SupplierStorage.collection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
    mode: consoleRoot.source,
    userId,
    enforcedTargetId: consoleTargets.singleTargetId,
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
    targeting: consoleTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}

export function useSupplierConsole() {
  return useConsoleFamilyRuntime('supplier', createSupplierConsole)
}
