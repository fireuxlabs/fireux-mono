import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import { readKitchenFulfilmentConfig } from '../../utils/kitchen-readers.ts'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

export async function readKitchenFulfilment(
  db: RuntimeFirestore,
  kitchenIdValue: unknown
): Promise<KitchenFulfilment> {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const policy = await db.doc(`kitchens/${kitchenId}/fulfilment/policy`).get()

  return policy.exists
    ? readKitchenFulfilmentConfig(policy.data())
    : { delivery_zones: [], payment_methods: [] }
}
