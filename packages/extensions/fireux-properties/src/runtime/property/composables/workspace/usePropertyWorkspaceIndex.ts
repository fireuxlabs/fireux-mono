import { computed, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useState, useRoute, useRouter, navigateTo } from '#imports'
import { propertyWorkspaceSwitchPath } from '../../utils/workspace-switch-route'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { usePropertyCollection } from '../usePropertyCollection'
import { usePropertyAccess } from '../usePropertyAccess'

export function usePropertyWorkspaceIndex() {
  const workspace = useWorkspace('property')
  const route = useRoute()
  const router = useRouter()
  const access = usePropertyAccess()
  const properties = usePropertyCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const outcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : properties.outcome.value
  )
  const session = useAppSession()
  const config = useFireUXConfig()
  const selectionRequest = useState<number>(
    `property-selection-request:${config.appId}`,
    () => 0
  )
  const captureIntent = useCommandScope([
    selectionRequest,
    session.uid,
    session.appUser,
    () => config.appId,
    workspace.selectedId,
    access.ids,
    outcome,
  ])
  const canSelect = (id: string) =>
    outcome.value === 'ready' &&
    properties.properties.value.some((property) => property.id === id)

  watch(
    [properties.properties, outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        properties.properties.value.flatMap((property) =>
          property.id ? [property.id] : []
        ),
        outcome.value
      ),
    { immediate: true }
  )
  return {
    outcome,
    collection: properties.properties,
    selectedId: workspace.selectedId,
    select: async (id: string) => {
      if (!canSelect(id)) return
      selectionRequest.value += 1
      if (id === workspace.selectedId.value) return
      const isCurrent = captureIntent()
      const destination = propertyWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path)
      )
      if (destination) await navigateTo(destination, { replace: true })
      if (isCurrent() && canSelect(id)) workspace.select(id)
    },
  }
}
