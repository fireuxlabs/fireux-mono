import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { useSupplierAccess } from '../useSupplierAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useSupplierFetch } from '../firestore/fetch/useSupplierFetch'

export function useSupplierWorkspace() {
  const { selectedId: id } = useWorkspace('supplier')
  const access = useSupplierAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = useSupplierFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && source.supplier.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const data = computed(() => outcome.value === 'ready' && source.supplier.value?.id === readId.value ? source.supplier.value : null)
  return { data, id, outcome }
}
