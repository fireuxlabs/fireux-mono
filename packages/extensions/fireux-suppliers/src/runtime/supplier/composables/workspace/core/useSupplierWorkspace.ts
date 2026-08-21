// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: validate Supplier selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve Supplier demos through the lazy workspace adapter.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: make Supplier core own target ids and membership outcome.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useWorkspace,
  type WorkspaceSource,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { workspaceData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceEntityRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntityRuntime'
import { useWorkspaceFamilyRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import { useWorkspaceTargets } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useSupplierCollection } from '../../firestore/fetch/useSupplierCollection'
import { type SupplierSurface } from '../../firestore/utils/view/useSupplierInterface'
import { SupplierStorage } from '../../../models/Supplier.model.ts'
import { useSupplierWorkspaceDemoData } from './useSupplierWorkspaceDemoData'

/**
 * FireUX stack family: Workspace-backed root entity.
 * Entity: Supplier.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-suppliers/docs/contract.md
 *
 * This file adapts Supplier root/app authority sources into the private /workspace/supplier selected runtime.
 * It should not own Supplier catalogue or product operation records; those live under workspace/supplier/operations.
 */
function createSupplierWorkspace() {
  const workspaceRoot = useWorkspace('supplier')
  const workspaceTargets = useWorkspaceTargets({ family: 'supplier' })
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed(() => {
    if (workspaceRoot.source.value === 'demo') return {}
    return workspaceTargets.filter({
      operatorId: userId.value,
    })
  })
  const sourceCollection = useSupplierCollection({
    source: workspaceRoot.source,
    filter: targetFilter,
  })
  const demoData = useSupplierWorkspaceDemoData(
    computed(() => workspaceRoot.source.value === 'demo')
  )
  const targetSuppliers = computed<SupplierSurface[]>(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoData.data.value?.suppliers ?? [])
      : sourceCollection.suppliers.value
  )
  const targetData = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoData.data.value?.suppliers ?? []).map((supplier) =>
          workspaceData('demo', supplier)
        )
      : sourceCollection.suppliers.value.map((supplier) =>
          workspaceData(
            workspaceRoot.source.value === 'test' ? 'test' : 'live',
            supplier
          )
        )
  )
  const targetsPending = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.pending.value
      : sourceCollection.pending.value
  )
  const targetsError = computed<unknown | undefined>(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.error.value
      : sourceCollection.error.value
  )
  const sourceTargetsOutcome = computed<WorkspaceTargetOutcome>(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.outcome.value
      : sourceCollection.outcome.value
  )
  const membershipAwareTargetsOutcome =
    workspaceTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed<WorkspaceTargetOutcome>(() =>
    workspaceRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useWorkspaceEntityRuntime<SupplierSurface>({
    family: 'supplier',
    storageFamily: SupplierStorage.collection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
    mode: workspaceRoot.source,
    userId,
    enforcedTargetId: workspaceTargets.singleTargetId,
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
    source: WorkspaceSource = workspaceRoot.source.value
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
    targeting: workspaceTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}

export function useSupplierWorkspace() {
  return useWorkspaceFamilyRuntime('supplier', createSupplierWorkspace)
}
