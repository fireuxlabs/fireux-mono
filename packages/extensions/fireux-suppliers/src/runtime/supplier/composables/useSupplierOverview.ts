import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { useSupplierWorkspace } from './workspace/useSupplierWorkspace'
import { useSupplierWorkspaceIndex } from './workspace/useSupplierWorkspaceIndex'

export function useSupplierOverview() {
  const workspace = useSupplierWorkspace()
  const index = useSupplierWorkspaceIndex()
  const selectedSupplier = computed(() =>
    workspace.outcome.value === 'ready' && index.outcome.value === 'ready'
      ? (index.collection.value.find(
          (supplier) => supplier.id === workspace.id.value
        ) ?? null)
      : null
  )
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (index.outcome.value === 'empty') return 'missing'
    if (index.outcome.value !== 'ready') return index.outcome.value
    return selectedSupplier.value ? 'ready' : 'missing'
  })
  const { focus } = useOverview({
    entity: selectedSupplier,
    id: workspace.id,
    outcome,
  })
  const multiple = computed(() => ({
    items: index.collection.value,
    count: index.collection.value.length,
    hasItems: index.collection.value.length > 0,
    outcome: index.outcome.value,
  }))

  return {
    focus,
    multiple,
    outcome,
    selectedSupplier,
    supplierId: workspace.id,
  }
}
