import { watch } from 'vue'
import { useState, useRoute, useRouter, navigateTo } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenWorkspaceKitchens } from './useKitchenWorkspaceKitchens'
import { kitchenWorkspaceSwitchPath } from '../../../utils/workspace-switch-route'

export function useKitchenWorkspaceIndex() {
  const { appId } = useFireUXConfig()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${appId}`,
    () => ''
  )
  const route = useRoute()
  const router = useRouter()
  const workspace = useWorkspace('kitchen')
  const source = useKitchenWorkspaceKitchens()

  watch(
    [
      source.kitchens,
      source.outcome,
      workspace.selectedId,
      adoptedSelection,
      () => route.query.kitchenId,
    ],
    () => {
      const ids = source.kitchens.value.map((kitchen) => kitchen.id || '')
      const requestedId =
        typeof route.query.kitchenId === 'string' ? route.query.kitchenId : ''
      if (
        route.path.startsWith('/workspace/kitchen') &&
        requestedId &&
        source.outcome.value === 'ready' &&
        ids.includes(requestedId)
      ) {
        workspace.select(requestedId)
        const { kitchenId: _requested, ...query } = route.query
        void navigateTo(
          { path: route.path, query, hash: route.hash },
          { replace: true }
        )
        return
      }
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
    select: async (id: string) => {
      if (id === workspace.selectedId.value) return
      const destination = kitchenWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path)
      )
      if (destination) await navigateTo(destination, { replace: true })
      workspace.select(id)
    },
  }
}
