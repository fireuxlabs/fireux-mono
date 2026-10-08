import { FieldValue } from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readKitchenOfferingsInTransaction } from '../offerings/read'
import { serverKitchenOfferingsTarget } from '../offerings/target'
import { kitchenOfferingData } from '../../utils/offerings'
import { patchKitchenOfferingInteraction } from '../../utils/offering-interaction'
import type { KitchenOffering } from '../../models/offering.model'
import {
  readOfferingCreate,
  readOfferingUpdate,
  requireConfiguredOffering,
} from './validation'
import { readInteractionChanges } from './interaction-validation'

const missing = () =>
  createError({ statusCode: 404, statusMessage: 'Offering not found.' })

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

export async function updateKitchenOffering(event: H3Event, input: unknown) {
  const { kitchenId, offeringId, changes } = readOfferingUpdate(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const offerings = await readKitchenOfferingsInTransaction(tx, kitchenId)
    const current = offerings.find((row) => row.id === offeringId)
    if (!current) throw missing()
    const { hours, ...fields } = changes
    const offering = { ...current, ...fields }
    if (hours === null) delete offering.hours
    else if (hours !== undefined) offering.hours = hours
    requireConfiguredOffering(offering)
    for (const id of changes.menu_ids ||
      (changes.enabled === true ? offering.menu_ids : [])) {
      const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
    }
    tx.update(serverKitchenOfferingsTarget(kitchenId), offeringId, {
      ...kitchenOfferingData(offering),
      ...(hours === null ? { hours: FieldValue.delete() } : {}),
    })
    return { ok: true, kitchen_id: kitchenId, offering }
  })
}

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
      for (const id of offering.menu_ids) {
        const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
        if (!menu.exists)
          throw createError({
            statusCode: 400,
            statusMessage: 'A selected Menu no longer exists.',
          })
      }
    }
    tx.update(
      serverKitchenOfferingsTarget(kitchenId),
      offeringId,
      kitchenOfferingData(offering)
    )
    return { ok: true, kitchen_id: kitchenId, offering }
  })
}
