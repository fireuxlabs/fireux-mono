import { computed, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { usePropertyCollection } from '../../usePropertyCollection'
import { usePropertyWorkspaceAccess } from '../core/usePropertyWorkspaceAccess'

export function usePropertyWorkspaceIndex() {
  const workspace = useWorkspace('property')
  const access = usePropertyWorkspaceAccess()
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
    select: workspace.select,
    clear: workspace.clear,
  }
}
