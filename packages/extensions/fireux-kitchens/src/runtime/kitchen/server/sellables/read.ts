import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireKitchenWriter } from '../core/operator-access'
import { readKitchenSellable } from '../../utils/sellable'

export async function readWorkspaceKitchenSellable(
  event: H3Event,
  input: { kitchenId?: unknown; sellableId?: unknown }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const sellableId = requireFirestoreDocumentId(input.sellableId, 'Sellable id')
  const { appId } = useFireUXConfig(event)
  const { db } = await requireKitchenWriter(event, { appId, kitchenId })
  const snapshot = await db
    .doc(`kitchens/${kitchenId}/sellables/${sellableId}`)
    .get()
  if (!snapshot.exists)
    throw createError({ statusCode: 404, statusMessage: 'Sellable not found.' })
  return { id: sellableId, ...readKitchenSellable(snapshot.data()) }
}
