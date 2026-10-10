import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import {
  serverKitchenMenusTarget,
  FIRESTORE_MUTATION_TARGETS,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

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
    const matching: string[] = []
    let afterId: string | undefined
    while (true) {
      const page = await tx.query(FIRESTORE_MUTATION_TARGETS.menus, {
        field: 'source.kitchen_id',
        op: '==',
        value: kitchenId,
        limit: 100,
        afterId,
      })
      for (const row of page)
        if (
          row.data.source?.kitchen_id === kitchenId &&
          row.data.source?.menu_id === menuId
        )
          matching.push(row.id)
      if (page.length < 100) break
      afterId = page.at(-1)!.id
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    for (const id of matching)
      tx.update(FIRESTORE_MUTATION_TARGETS.menus, id, {
        status: 'archived',
        updated: stamp,
      })
    // Preserve the existing document-only deletion: no child/source cascade.
    tx.delete(serverKitchenMenusTarget(kitchenId), menuId)
  })
  return { ok: true as const, kitchenId, menuId }
}
