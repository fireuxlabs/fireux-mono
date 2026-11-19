import { useWorkspaceRecord } from 'fireux-core/runtime/workspace/composables/useWorkspaceRecord'
import { computed, watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useSupplierCollection } from '../useSupplierCollection'
import { useSupplierAccess } from '../useSupplierAccess'
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
  const { data, outcome } = useWorkspaceRecord(
    id,
    access,
    useSupplierFetch,
    (source) => source.supplier
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
