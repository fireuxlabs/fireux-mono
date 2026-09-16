import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { syncKitchenMenuDirectory } from '../directory/sync'

type MenuInput = { kitchenId?: unknown; menuId?: unknown }

export async function unpublishKitchenMenu(event: H3Event, input: MenuInput) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await mutations.read(target, menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (menu.data?.status === 'archived')
      throw createError({
        statusCode: 409,
        statusMessage: 'This menu is archived.',
      })
    mutations.update(target, menuId, {
      status: 'draft',
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  // Public consumers check the scoped status. A retry also repairs its directory projection.
  await syncKitchenMenuDirectory({
    appId: actor.runtimeAppId,
    db: getRuntimeFirestore(),
    kitchenId,
    menuId,
    uid: actor.uid,
  })
  return { ok: true as const }
}
