import { watch } from 'vue'
import { useState } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenWorkspaceKitchens } from './useKitchenWorkspaceKitchens'

export function useKitchenWorkspaceIndex() {
  const { appId } = useFireUXConfig()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${appId}`,
    () => ''
  )
  const workspace = useWorkspace('kitchen')
  const source = useKitchenWorkspaceKitchens()

  watch(
    [source.kitchens, source.outcome, workspace.selectedId, adoptedSelection],
    () => {
      const ids = source.kitchens.value.map((kitchen) => kitchen.id || '')
      if (
        source.outcome.value === 'ready' &&
        ids.includes(adoptedSelection.value)
      ) {
        workspace.select(adoptedSelection.value)
        adoptedSelection.value = ''
      } else workspace.reconcile(ids, source.outcome.value)
    },
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
