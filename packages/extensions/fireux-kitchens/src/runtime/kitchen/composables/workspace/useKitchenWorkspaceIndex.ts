import { computed, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { useState, useRoute, useRouter, navigateTo } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenWorkspaceKitchens } from './useKitchenWorkspaceKitchens'
import { kitchenWorkspaceSwitchPath } from '../../utils/workspace-switch-route'

export function useKitchenWorkspaceIndex() {
  const { appId } = useFireUXConfig()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${appId}`,
    () => ''
  )
  const selectionIntent = useState<number>(
    `kitchen-selection-intent:${appId}`,
    () => 0
  )
  const route = useRoute()
  const router = useRouter()
  const workspace = useWorkspace('kitchen')
  const source = useKitchenWorkspaceKitchens()
  const session = useAppSession()
  const captureIntent = useCommandScope([
    session.uid,
    session.appUser,
    workspace.selectedId,
    source.outcome,
    selectionIntent,
  ])
  const canSelect = (id: string) =>
    source.outcome.value === 'ready' &&
    source.kitchens.value.some((kitchen) => kitchen.id === id)
  // Presentation only: retained associations and selection are never truncated.
  const multipleKitchenView = computed(
    () =>
      !session.pending.value &&
      !session.error.value &&
      resolveAppUserAccess(session.appUser.value).hasBusinessSubscription
  )

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
    multipleKitchenView,
    outcome: source.outcome,
    selectedId: workspace.selectedId,
    select: async (id: string) => {
      if (!canSelect(id)) return
      selectionIntent.value += 1
      if (id === workspace.selectedId.value) return
      const isCurrent = captureIntent()
      const destination = kitchenWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path)
      )
      if (destination) await navigateTo(destination, { replace: true })
      if (isCurrent() && canSelect(id)) workspace.select(id)
    },
  }
}
