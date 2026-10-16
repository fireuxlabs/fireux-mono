import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { serverKitchenOfferingsTarget } from '../../../kitchen/server/offerings/target'
import { serverKitchenMenuSectionsTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'

export async function deleteKitchenMenu(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Invalid Menu input.' })
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !['kitchenId', 'menuId'].includes(key)))
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Menu field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id'),
    menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await tx.read(target, menuId)
    if (!menu.exists) return
    if (menu.data?.status === 'published' || menu.data?.schedule === 'daily')
      throw createError({
        statusCode: 409,
        statusMessage: 'Archive a regular Menu before permanently deleting it.',
      })
    const [sections, services] = await Promise.all([
      tx.readAll(serverKitchenMenuSectionsTarget(kitchenId, menuId), 1),
      tx.query(serverKitchenOfferingsTarget(kitchenId), {
        field: 'menu_ids',
        op: 'array-contains',
        value: menuId,
        limit: 1,
      }),
    ])
    const doc = menu.data?.doc
    if (
      sections.length ||
      (doc && (typeof doc !== 'object' || Object.values(doc).some(Boolean)))
    )
      throw createError({
        statusCode: 409,
        statusMessage:
          'Only empty Menus can be permanently deleted. Archive this Menu to keep its content.',
      })
    if (services.length)
      throw createError({
        statusCode: 409,
        statusMessage:
          'Remove this Menu from its services before permanently deleting it.',
      })
    tx.delete(target, menuId)
  })
  return { ok: true as const, kitchenId, menuId }
}
