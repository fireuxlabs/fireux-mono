import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'

type CloseKitchenOrderInput = {
  kitchenId: string
  orderId: string
  kitchenCollectionPath?: string
}

export function useKitchenOrderToggleItem() {
  const db = useFirestore()

  const closeOrder = async (input: CloseKitchenOrderInput) => {
    const kitchenId = String(input.kitchenId || '').trim()
    const orderId = String(input.orderId || '').trim()
    if (!kitchenId) throw new Error('Missing kitchenId')
    if (!orderId) throw new Error('Missing orderId')

    const kitchenCollectionPath = String(
      input.kitchenCollectionPath || DEFAULT_KITCHEN_COLLECTION_PATH
    ).trim()

    const ref = doc(db, `${kitchenCollectionPath}/${kitchenId}/orders/${orderId}`)

    await updateDoc(ref, {
      status: 'closed',
      updated_at: serverTimestamp(),
    })
  }

  return { closeOrder }
}
