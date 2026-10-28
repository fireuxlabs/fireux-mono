import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'

export async function changeKitchenMenuPublication(
  event: H3Event,
  input: unknown,
  action: 'unpublish' | 'archive' | 'restore'
) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !['kitchenId', 'menuId'].includes(key))
  )
    throw createError({ statusCode: 400, statusMessage: 'Invalid Menu input.' })
  const value = input as Record<string, unknown>
  const status = action === 'archive' ? 'archived' : 'draft'
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await tx.read(target, menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (menu.data?.schedule === 'daily' && action !== 'unpublish')
      throw createError({
        statusCode: 400,
        statusMessage: 'Use Daily specials publication controls.',
      })
    if (action === 'restore' && menu.data?.status !== 'archived') return
    if (menu.data?.status === 'archived' && action === 'unpublish')
      throw createError({
        statusCode: 409,
        statusMessage: 'This menu is archived.',
      })
    const stamp =
      menu.data?.status === status && menu.data.updated
        ? menu.data.updated
        : serverAuditStamp({ by: actor.uid })
    if (menu.data?.status !== status)
      tx.update(target, menuId, { status, updated: stamp })
  })
  return { ok: true as const }
}
