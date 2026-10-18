import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { serverKitchenOfferingsTarget } from './target'
import { kitchenOfferingData } from '../../utils/offerings'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { readKitchenOfferingsInTransaction } from './read'
import { patchKitchenOfferingInteraction } from '../../utils/offering-interaction'
import { requireConfiguredOffering, requireServiceMenus } from './validation'
import { readInteractionChanges } from './interaction-validation'

const missing = () =>
  createError({ statusCode: 404, statusMessage: 'Offering not found.' })

export async function updateKitchenOfferingInteraction(
  event: H3Event,
  input: unknown
) {
  const { kitchenId, offeringId, type, changes } = readInteractionChanges(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const offerings = await readKitchenOfferingsInTransaction(tx, kitchenId)
    const current = offerings.find((row) => row.id === offeringId)
    if (!current) throw missing()
    const interaction = patchKitchenOfferingInteraction(
      type,
      current.interactions.find((row) => row.type === type),
      changes
    )
    const offering = {
      ...current,
      interactions: [
        ...current.interactions.filter((row) => row.type !== type),
        interaction,
      ],
    }
    requireConfiguredOffering(offering)
    if (offering.enabled && interaction.enabled) {
      const selectedMenus = []
      for (const id of offering.menu_ids) {
        const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
        if (!menu.exists)
          throw createError({
            statusCode: 400,
            statusMessage: 'A selected Menu no longer exists.',
          })
        selectedMenus.push(menu.data || {})
      }
      requireServiceMenus(selectedMenus, true)
    }
    tx.update(
      serverKitchenOfferingsTarget(kitchenId),
      offeringId,
      kitchenOfferingData(offering)
    )
    return { ok: true, kitchen_id: kitchenId, offering }
  })
}
