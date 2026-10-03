import { computed, watch } from 'vue'
import { useRoute, useRouter, navigateTo } from '#imports'
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
      if (id === workspace.selectedId.value) return
      const destination = propertyWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path)
      )
      if (destination) await navigateTo(destination, { replace: true })
      workspace.select(id)
    },
  }
}
