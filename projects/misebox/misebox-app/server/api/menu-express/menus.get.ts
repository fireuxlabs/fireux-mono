import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireKitchenWriterAccount } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { readKitchenMenuReviewChoices } from 'fireux-kitchens/runtime/menu/server/publication/review'
import { operator, assertOperator } from '../../menu-express/authority'
import { text } from '../../menu-express/contract'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const actor = await operator(event),
    kitchenId = text(getQuery(event).kitchenId, 'Kitchen id', 200)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await assertOperator(tx, actor.appId, actor.uid)
    await requireKitchenWriterAccount(
      { appId: actor.appId, kitchenId },
      actor.uid,
      tx
    )
    return readKitchenMenuReviewChoices(tx, kitchenId)
  })
})
