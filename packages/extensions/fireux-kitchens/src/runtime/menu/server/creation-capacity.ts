import { createError } from 'h3'
import { kitchenMenuCapacity } from '../utils/menu-capacity'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  requireKitchenMutationAuthority,
  type readKitchenMutationActor,
} from '../../kitchen/server/core/mutation-authority'

export async function requireMenuCreationCapacity(
  tx: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string
) {
  const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
  const limit = appSubscriptionCapacity(
    kitchenMenuCapacity,
    'kitchen.menus',
    access.subscription
  )
  if (limit !== null) {
    const menus = await tx.readAll(
      serverKitchenMenusTarget(kitchenId),
      Math.max(1, limit + 1)
    )
    if (
      !hasAppSubscriptionCapacity(
        kitchenMenuCapacity,
        'kitchen.menus',
        access.subscription,
        menus.length
      )
    ) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Your menu creation allowance has been reached. Existing menus remain available to manage.',
      })
    }
  }
  return access
}
