import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { readKitchenFulfilmentConfig } from '../../../utils/kitchen-fulfilment-reader'
import type { KitchenFulfilment } from '../../../models/fulfilment.model'

export function useKitchenFulfilment() {
  const identity = useKitchenWorkspaceIdentity()
  const { firestoreFetchDoc } = useFirestoreRead()
  const path = computed(() =>
    identity.kitchenId.value
      ? `kitchens/${identity.kitchenId.value}/fulfilment`
      : ''
  )
  const source = firestoreFetchDoc<KitchenFulfilment>(path, 'policy')
  return {
    ...identity,
    fulfilment: computed(() => readKitchenFulfilmentConfig(source.value)),
    pending: source.pending,
    error: source.error,
    canWrite: computed(
      () =>
        identity.canWrite.value &&
        ['ready', 'missing'].includes(source.outcome.value)
    ),
  }
}
