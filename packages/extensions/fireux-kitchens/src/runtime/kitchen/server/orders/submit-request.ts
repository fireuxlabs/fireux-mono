import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readKitchenMutationActor } from '../core/mutation-authority'
import { submitKitchenOrder, type MenuSubmissionContext } from './submission'

export async function submitKitchenOrderRequest(
  event: H3Event,
  input: unknown,
  menuContext?: MenuSubmissionContext
) {
  const caller = await requireFirebaseBearerUser(
    event,
    'Your ordering session is unavailable.',
    { allowAnonymous: true }
  )
  const config = useFireUXConfig(event)
  const operator = menuContext ? null : await readKitchenMutationActor(event)
  return submitKitchenOrder(
    {
      callerUid: caller.uid,
      appId: config.appId,
      isTenant: config.isTenant,
      ordering: useRuntimeConfig(event).public.ordering,
      operator,
    },
    input,
    menuContext
  )
}
