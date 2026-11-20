import type { H3Event } from 'h3'
import { readKitchenMutationActor } from '../core/mutation-authority'
import { respondToKitchenOrder, listKitchenSubmittedOrders } from './submission'

export async function respondToKitchenOrderRequest(
  event: H3Event,
  input: unknown
) {
  return respondToKitchenOrder(await readKitchenMutationActor(event), input)
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
