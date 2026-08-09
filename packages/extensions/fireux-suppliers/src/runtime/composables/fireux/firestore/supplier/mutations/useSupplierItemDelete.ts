import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

const text = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemDelete() {
  async function deleteSupplierItem(
    supplierId: string,
    supplierItemId: string
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
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  }

  return { deleteSupplierItem }
}
