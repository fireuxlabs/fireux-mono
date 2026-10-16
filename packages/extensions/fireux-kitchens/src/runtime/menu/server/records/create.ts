import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor } from '../../../kitchen/server/core/mutation-authority'
import { randomUUID } from 'node:crypto'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  normalizeMenuCreateInput,
  buildMenuPayload,
  type MenuCreateInput,
} from '../../utils/menu-create-input'
import { menuNameAndSlug, requireAvailableMenuSlug } from '../name'
import { requireMenuCreationCapacity } from '../creation-capacity'

export async function createKitchenMenu(event: H3Event, input: unknown) {
  let value: MenuCreateInput
  try {
    value = normalizeMenuCreateInput(input)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid Menu input.',
    })
  }
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const { name, slug } = menuNameAndSlug(event, value.name)
  const menuId = randomUUID()
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireMenuCreationCapacity(tx, actor, kitchenId)
    if (
      value.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily menus require Plus.',
      })
    if (!readPlaceCurrencyCode(access.placeData))
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Kitchen currency before creating menus.',
      })
    if (
      access.subscription === 'free' &&
      !['main', 'food', 'drinks'].includes(slug)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Custom Menu names require Plus.',
      })
    const canonicalName =
      access.subscription === 'free'
        ? slug === 'main'
          ? 'Main'
          : slug === 'food'
            ? 'Food'
            : 'Drinks'
        : name
    await requireAvailableMenuSlug(tx, kitchenId, slug)
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(serverKitchenMenusTarget(kitchenId), menuId, {
      ...buildMenuPayload(value, canonicalName),
      slug,
      created: stamp,
      updated: stamp,
    })
  })
  return { created: true, id: menuId, slug, kitchenId }
}
