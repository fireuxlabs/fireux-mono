import { computed, watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export type KitchenWorkspaceIndexState = {
  user: { id: string; anonymous: boolean }
  kitchen: { id: string; name: string; tagline: string; url: string }
}

export type KitchenWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
}

export function useKitchenWorkspaceIndex() {
  const workspace = useKitchenWorkspace()
  const pageState = useWorkspacePageState('kitchen')

  const state = computed<KitchenWorkspaceIndexState>(() => {
    const selectedKitchen = workspace.selection.kitchen.value
    const presentation = readKitchenPresentationIdentity(selectedKitchen)
    return {
      user: {
        id: workspace.user.currentUser.value?.uid || '',
        anonymous: Boolean(workspace.user.currentUser.value?.isAnonymous),
      },
      kitchen: {
        id: normalizeString(selectedKitchen?.id),
        name: presentation.displayName,
        tagline: presentation.tagline,
        url:
          presentation.cardImageUrl ||
          presentation.imageUrl ||
          presentation.logoImageUrl,
      },
    }
  })

  const derived = computed<KitchenWorkspaceIndexDerived>(() => ({
    outcome: workspace.targets.outcome.value,
    hasSelection: workspace.selection.hasSelection.value,
    canCreate:
      (workspace.targets.outcome.value === 'ready' ||
        workspace.targets.outcome.value === 'empty') &&
      workspace.runtime.canCreate.value &&
      (workspace.targets.count.value === 0 ||
        workspace.user.canOwnMultipleWorkspaces.value),
  }))

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      kitchen: state.value.kitchen,
      derived: derived.value,
    })
  })

  return { state, derived }
}
