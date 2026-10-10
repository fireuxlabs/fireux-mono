import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { serverKitchenOfferingsTarget } from './target'
import { kitchenOfferingData } from '../../utils/offerings'
import type { KitchenOffering } from '../../models/offering.model'
import { readOfferingCreate } from './validation'

export async function createKitchenOffering(event: H3Event, input: unknown) {
  const { kitchenId, name } = readOfferingCreate(input)
  const actor = await readKitchenMutationActor(event)
  const id = randomUUID()
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const offering: KitchenOffering = {
      id,
      name,
      enabled: false,
      menu_ids: [],
      interactions: [{ type: 'browse', enabled: true }],
    }
    tx.create(
      serverKitchenOfferingsTarget(kitchenId),
      id,
      kitchenOfferingData(offering)
    )
    return { ok: true, kitchen_id: kitchenId, offering }
  })
}
