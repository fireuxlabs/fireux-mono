import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readKitchenMutationActor } from '../core/mutation-authority'
import { submitKitchenOrder } from './submission'

export async function submitKitchenOrderRequest(
  event: H3Event,
  input: unknown
) {
  const operator = await readKitchenMutationActor(event)
  return submitKitchenOrder(
    {
      callerUid: operator.uid,
      appId: operator.runtimeAppId,
      ordering: useRuntimeConfig(event).public.ordering,
      operator,
    },
    input
  )
}
