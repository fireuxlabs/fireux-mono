import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'

export async function withdrawKitchenMenu(
  event: H3Event,
  input: { kitchenId?: unknown; menuId?: unknown },
  status: 'draft' | 'archived'
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
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
    if (menu.data?.status === 'archived' && status === 'draft')
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
