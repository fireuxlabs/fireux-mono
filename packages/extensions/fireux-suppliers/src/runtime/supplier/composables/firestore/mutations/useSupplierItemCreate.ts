import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  SupplierItemStorage,
  type SupplierItemCreateInput,
} from '../../../models/supplier-item.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemCreate() {
  async function createSupplierItem(
    supplierId: string,
    input: SupplierItemCreateInput
  ): Promise<string> {
    const id = text(supplierId)
    if (!id) throw new Error('[fireux-suppliers] supplier id is required.')
    if (!text(input.product_id)) {
      throw new Error('[fireux-suppliers] product_id is required.')
    }
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: true; supplier_item_id: string }>(
      `/api/suppliers/${encodeURIComponent(id)}/items`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: input,
      }
    )
    const supplierItemId = text(result.supplier_item_id)
    if (!result.ok || !supplierItemId) {
      throw new Error('[fireux-suppliers] Supplier Item creation was invalid.')
    }
    return supplierItemId
  }

  return {
    createSupplierItem,
    collectionName: SupplierItemStorage.collection,
  }
}
