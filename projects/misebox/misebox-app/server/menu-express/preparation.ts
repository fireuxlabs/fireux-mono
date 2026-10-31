import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { downloadStorageFile } from 'fireux-core/runtime/server/utils/uploads/storage'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireKitchenWriterAccount } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { saveKitchenMenuSource } from 'fireux-kitchens/runtime/menu/server/source/save'
import { requireChatSessionAccess } from 'fireux-core/runtime/server/utils/chat/session'
import { operator, assertOperator } from './authority'
import { dto, fail, requestId, requirePaid, text } from './contract'

/** Service adapter: bind one request to the ordinary Menus source/Menu identity. */
export async function prepareRequest(
  event: H3Event,
  rawId: unknown,
  input: Record<string, unknown>
) {
  if (
    Object.keys(input).some(
      (key) =>
        !['action', 'kitchenId', 'token', 'operator', 'revision'].includes(key)
    )
  )
    fail('Preparation accepts a Kitchen, not a manually linked Menu.')
  const id = requestId(rawId),
    actor = await operator(event)
  const kitchenId = text(input.kitchenId, 'Kitchen id', 200),
    menuId = `menu-express-${id}`
  const request = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await assertOperator(tx, actor.appId, actor.uid)
      await requireChatSessionAccess(tx, {
        appId: actor.appId,
        conversationId: id,
        isAdmin: true,
        writable: true,
      })
      await requireKitchenWriterAccount(
        { appId: actor.appId, kitchenId },
        actor.uid,
        tx
      )
      const record = await tx.read(actor.target, id)
      if (!record.exists) fail('Request not found.', 404)
      const request = dto(id, record.data!)
      requirePaid(request)
      if (request.stage === 'delivered')
        fail('Delivered requests cannot be prepared again.', 409)
      if (
        request.target &&
        (request.target.kitchenId !== kitchenId ||
          request.target.menuId !== menuId)
      )
        fail('This request is already bound to another preparation.', 409)
      if (!request.sources.length && !request.sourceUrl)
        fail('Supply a Menu source before preparing.', 409)
      if (!request.target)
        tx.update(actor.target, id, {
          target: { kitchenId, menuId },
          stage: 'preparing',
          updatedAt: new Date().toISOString(),
        })
      return {
        ...request,
        target: { kitchenId, menuId },
        stage: request.target ? request.stage : 'preparing',
      }
    }
  )
  const common = {
    appId: actor.appId,
    kitchenId,
    uploadId: menuId,
    replaceExisting: false,
  }
  if (request.sources.length) {
    const files = await Promise.all(
      request.sources.map(async (source) => {
        const { buffer } = await downloadStorageFile({
          objectPath: `apps/${actor.appId}/menu-express/${id}/sources/${source.id}`,
        })
        if (createHash('sha256').update(buffer).digest('hex') !== source.id)
          fail('The supplied source changed. Preparation stopped.', 409)
        return { data: buffer, fileName: source.name, contentType: source.type }
      })
    )
    await saveKitchenMenuSource({ ...common, files }, actor.uid)
  } else {
    const sourceUrl = new URL(request.sourceUrl)
    await saveKitchenMenuSource(
      {
        ...common,
        sourceUrl: sourceUrl.toString(),
        sourceProvider: sourceUrl.hostname,
      },
      actor.uid
    )
  }
  return request
}
