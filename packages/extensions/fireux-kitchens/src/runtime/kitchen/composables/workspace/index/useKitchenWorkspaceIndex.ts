import { watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenWorkspaceKitchens } from './useKitchenWorkspaceKitchens'

export function useKitchenWorkspaceIndex() {
  const workspace = useWorkspace('kitchen')
  const source = useKitchenWorkspaceKitchens()

  watch(
    [source.kitchens, source.outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        source.kitchens.value.map((kitchen) => kitchen.id || ''),
        source.outcome.value
      ),
    { immediate: true }
  )

  // Opening a Workspace is local selection, not an account-primary mutation.
  return {
    collection: source.kitchens,
    outcome: source.outcome,
    selectedId: workspace.selectedId,
    select: workspace.select,
  }
}
