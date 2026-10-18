import { hoursWithinParent } from '../../utils/service-hours'
import { resolveKitchenOperationHours } from '../../utils/kitchen-readers'
import { FieldValue } from 'firebase-admin/firestore'
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
import {
  readOfferingUpdate,
  requireConfiguredOffering,
  requireServiceMenus,
} from './validation'

const missing = () =>
  createError({ statusCode: 404, statusMessage: 'Offering not found.' })

export async function updateKitchenOffering(event: H3Event, input: unknown) {
  const { kitchenId, offeringId, changes } = readOfferingUpdate(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const offerings = await readKitchenOfferingsInTransaction(tx, kitchenId)
    const current = offerings.find((row) => row.id === offeringId)
    if (!current) throw missing()
    if (
      changes.menu_ids !== undefined &&
      current.interactions.some(
        (row) => row.type === 'eat_in' || row.type === 'takeaway'
      )
    )
      throw createError({
        statusCode: 400,
        statusMessage:
          'Choose menus separately for Eat in and Takeaway in Services.',
      })
    const { hours, ...fields } = changes
    const offering = { ...current, ...fields }
    if (hours === null) delete offering.hours
    else if (hours !== undefined) offering.hours = hours
    if (
      hours &&
      !hoursWithinParent(
        hours,
        resolveKitchenOperationHours(authority.rootData, authority.placeData)
      )
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Serving hours must be within Kitchen service hours.',
      })
    requireConfiguredOffering(offering)
    const selectedMenus = []
    for (const id of changes.menu_ids ||
      (changes.enabled === true ? offering.menu_ids : [])) {
      const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
      selectedMenus.push(menu.data || {})
    }
    if (changes.menu_ids || changes.enabled === true)
      requireServiceMenus(selectedMenus, offering.enabled)
    tx.update(serverKitchenOfferingsTarget(kitchenId), offeringId, {
      ...kitchenOfferingData(offering),
      ...(hours === null ? { hours: FieldValue.delete() } : {}),
    })
    return { ok: true, kitchen_id: kitchenId, offering }
  })
}
