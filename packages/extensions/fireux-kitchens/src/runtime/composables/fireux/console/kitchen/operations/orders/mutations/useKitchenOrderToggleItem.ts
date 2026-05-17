import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { resolveKitchenConsoleCollectionPath } from '../../collections/useKitchenChildCollection'

type CloseKitchenOrderInput = {
  kitchenId: string
  orderId: string
  kitchenCollectionPath?: string
}

export function useKitchenOrderToggleItem() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const closeOrder = async (input: CloseKitchenOrderInput) => {
    const kitchenId = String(input.kitchenId || '').trim()
    const orderId = String(input.orderId || '').trim()
    if (!kitchenId) throw new Error('Missing kitchenId')
    if (!orderId) throw new Error('Missing orderId')

    const kitchenCollectionPath = String(
      input.kitchenCollectionPath || ''
    ).trim() || resolveKitchenConsoleCollectionPath(appId)

    const ref = doc(db, `${kitchenCollectionPath}/${kitchenId}/orders/${orderId}`)

    await updateDoc(ref, {
      status: 'closed',
      updated_at: serverTimestamp(),
    })
  }

  return { closeOrder }
}
