import { computed, watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export type KitchenWorkspaceIndexState = {
  user: { id: string; anonymous: boolean }
  kitchen: { id: string; name: string; tagline: string; url: string }
  kitchens: { id: string; name: string; tagline: string; url: string }[]
}

export type KitchenWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

export function useKitchenWorkspaceIndex() {
  const workspace = useKitchenWorkspace()
  const pageState = useWorkspacePageState('kitchen')

  const state = computed<KitchenWorkspaceIndexState>(() => {
    const selectedKitchen = workspace.selection.kitchen.value
    const identity = selectedKitchen?.identity
    return {
      user: {
        id: workspace.user.currentUser.value?.uid || '',
        anonymous: Boolean(workspace.user.currentUser.value?.isAnonymous),
      },
      kitchen: {
        id: normalizeString(selectedKitchen?.id),
        name: normalizeString(identity?.display_name),
        tagline: normalizeString(identity?.tagline),
        url: normalizeString(identity?.image_url),
      },
      kitchens: workspace.targets.kitchens.value.map((item) => ({
        id: normalizeString(item.id),
        name: normalizeString(item.identity?.display_name),
        tagline: normalizeString(item.identity?.tagline),
        url: normalizeString(item.identity?.image_url),
      })),
    }
  })

  const derived = computed<KitchenWorkspaceIndexDerived>(() => ({
    outcome: workspace.targets.outcome.value,
    hasSelection: workspace.selection.hasSelection.value,
    canSelectMultiple: workspace.user.canOwnMultipleWorkspaces.value,
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
