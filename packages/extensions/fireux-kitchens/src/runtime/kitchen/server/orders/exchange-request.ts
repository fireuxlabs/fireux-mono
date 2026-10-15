import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readKitchenMutationActor } from '../core/mutation-authority'
import {
  respondToKitchenOrder,
  readKitchenOrderResponse,
  listKitchenSubmittedOrders,
} from './submission'

export async function respondToKitchenOrderRequest(
  event: H3Event,
  input: unknown
) {
  return respondToKitchenOrder(await readKitchenMutationActor(event), input)
}
export async function readKitchenOrderResponseRequest(
  event: H3Event,
  input: unknown
) {
  const caller = await requireFirebaseBearerUser(
    event,
    'Your ordering session is unavailable.',
    { allowAnonymous: true }
  )
  return readKitchenOrderResponse(
    { callerUid: caller.uid, appId: useFireUXConfig(event).appId },
    input
  )
}
export async function listKitchenSubmittedOrdersRequest(
  event: H3Event,
  kitchenId: unknown
) {
  return listKitchenSubmittedOrders(
    await readKitchenMutationActor(event),
    kitchenId
  )
}
