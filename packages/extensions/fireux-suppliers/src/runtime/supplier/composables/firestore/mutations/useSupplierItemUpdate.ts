import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { SupplierItemUpdateInput } from '../../../models/supplier-item.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemUpdate() {
  async function updateSupplierItem(
    supplierId: string,
    supplierItemId: string,
    patch: SupplierItemUpdateInput
  ): Promise<void> {
    const id = text(supplierId)
    const itemId = text(supplierItemId)
    if (!id) throw new Error('[fireux-suppliers] supplier id is required.')
    if (!itemId) throw new Error('[fireux-suppliers] supplier item id is required.')
    const user = await useRequireUser()
    const token = await user.getIdToken()
    await $fetch(
      `/api/suppliers/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: patch,
      }
    )
  }

  return { updateSupplierItem }
}
