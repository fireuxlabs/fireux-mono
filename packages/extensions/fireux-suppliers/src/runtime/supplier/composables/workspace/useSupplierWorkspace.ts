import { computed, watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useSupplierCollection } from '../useSupplierCollection'
import { useSupplierAccess } from '../useSupplierAccess'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { useSupplierFetch } from '../firestore/fetch/useSupplierFetch'

export const useSupplierWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('supplier')
  const access = useSupplierAccess()
  const suppliers = useSupplierCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const collectionOutcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : suppliers.outcome.value
  )
  watch(
    [suppliers.suppliers, collectionOutcome, selection.selectedId],
    () =>
      selection.reconcile(
        suppliers.suppliers.value.flatMap((supplier) =>
          supplier.id ? [supplier.id] : []
        ),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  const id = selection.selectedId
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = useSupplierFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (
      source.outcome.value === 'ready' &&
      source.supplier.value?.id !== readId.value
    )
      return 'pending'
    return source.outcome.value
  })
  const data = computed(() =>
    outcome.value === 'ready' && source.supplier.value?.id === readId.value
      ? source.supplier.value
      : null
  )

  return {
    data,
    id,
    outcome,
    collectionOutcome,
    collection: suppliers.suppliers,
    select: selection.select,
  }
})
