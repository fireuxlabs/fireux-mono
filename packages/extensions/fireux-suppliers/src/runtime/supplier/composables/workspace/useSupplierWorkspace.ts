import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { SupplierStorage } from '../../models/Supplier.model.ts'
import { useSupplierCreate } from '../firestore/mutations/useSupplierCreate'
import { useSupplierUpdate } from '../firestore/mutations/useSupplierUpdate'
import { useSupplierFetch } from '../firestore/fetch/useSupplierFetch'

export function useSupplierWorkspace() {
  const { selectedId: id } = useWorkspace('supplier')
  const creation = useSupplierCreate()
  const update = useSupplierUpdate()
  const { deleteDocument } = useFirestoreDelete()
  const { supplier: data, outcome } = useSupplierFetch(id)
  return { data, id, outcome, crud: {
    create: creation.createSupplierWorkspace,
    update: (changes: Parameters<typeof update.updateSupplierRoot>[0]['changes']) => update.updateSupplierRoot({ supplierId: id.value, changes }),
    delete: () => deleteDocument(SupplierStorage.collection, id.value),
  } }
}
