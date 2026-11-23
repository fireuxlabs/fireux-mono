import { computed, watch } from 'vue'
import { useWorkspace } from 'fireux-workspace/runtime/workspace/composables/useWorkspace'
import { useWorkspaceRecord } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceRecord'
import { useKitchenAccess } from '../useKitchenAccess'
import { useKitchenRead } from '../useKitchenRead'

export function useKitchenOnlyWorkspace() {
  const access = useKitchenAccess()
  const { selectedId, reconcile } = useWorkspace('kitchen')
  watch(
    [access.ids, access.outcome, selectedId],
    ([ids, state]) => reconcile(ids, state),
    { immediate: true }
  )
  const record = useWorkspaceRecord(
    selectedId,
    access,
    (id) => useKitchenRead(id, { hydrate: false }),
    (state) => state.kitchen
  )
  return {
    ...record,
    error: computed(() => access.error.value ?? record.source.error.value),
    selectedId,
    access,
  }
}
