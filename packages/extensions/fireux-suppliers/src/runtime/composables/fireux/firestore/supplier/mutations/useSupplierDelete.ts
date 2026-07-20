// Concurrent edit — 2026-07-20 22:11 CEST — Both-Entity Authority — Supplier: expose separate fixed root and App-overlay deletes.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  AppSupplierStorage,
  SupplierStorage,
} from '../../../../../models/supplier/Supplier.model'

export function useSupplierDelete() {
  const { deleteDocument } = useFirestoreDelete()
  const { appId } = useFireUXConfig()

  const resolveId = (value: string) => {
    const id = String(value ?? '').trim()
    if (!id) throw new Error('[useSupplierDelete] Supplier id is required')
    return id
  }

  const deleteSupplierRoot = async (supplierId: string) => {
    const id = resolveId(supplierId)
    await deleteDocument(SupplierStorage.rootCollection, id)
    return { id, scope: 'root' as const }
  }

  const deleteSupplierOverlay = async (supplierId: string) => {
    if (!appId) {
      throw new Error('[useSupplierDelete] App context required for supplier overlay delete')
    }

    const id = resolveId(supplierId)
    await deleteDocument(
      `${AppStorage.collection}/${appId}/${AppSupplierStorage.collection}`,
      id
    )
    return { id, scope: 'overlay' as const }
  }

  return {
    deleteSupplierRoot,
    deleteSupplierOverlay,
  }
}
