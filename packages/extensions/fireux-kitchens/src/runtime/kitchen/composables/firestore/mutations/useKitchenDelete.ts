import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { KitchenStorage } from '../../../models/kitchen.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteKitchen(kitchenId: string) {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required')

    await deleteDocument(KitchenStorage.collection, id)
  }

  return {
    deleteKitchen,
  }
}
