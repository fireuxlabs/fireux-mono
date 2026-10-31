import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  stageChatMessage,
  requireChatSessionAccess,
} from 'fireux-core/runtime/server/utils/chat/session'
import { requireKitchenWriterAccount } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { readKitchenMenuReview } from 'fireux-kitchens/runtime/menu/server/publication/review'
import { stagePublishKitchenMenu } from 'fireux-kitchens/runtime/menu/server/publication/publish'
import type { MenuExpressRequest } from '../../shared/types/menu-express'
import { operator, assertOperator } from './authority'
import { prepareRequest } from './preparation'
import { dto, fail, requestId, requirePaid } from './contract'

export async function operatorAction(
  event: H3Event,
  rawId: unknown,
  input: Record<string, unknown>
) {
  if (input.action === 'prepare') return prepareRequest(event, rawId, input)
  const id = requestId(rawId),
    actor = await operator(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await assertOperator(tx, actor.appId, actor.uid)
    await requireChatSessionAccess(tx, {
      appId: actor.appId,
      conversationId: id,
      isAdmin: true,
      writable: true,
    })
    const record = await tx.read(actor.target, id)
    if (!record.exists) fail('Request not found.', 404)
    const request = dto(id, record.data!)
    const updatedAt = new Date().toISOString()
    let changes: Partial<MenuExpressRequest>
    if (input.action === 'demo-payment') {
      if (!import.meta.dev || !request.demo)
        fail('Only local demo requests can use a demo payment.', 403)
      changes = { payment: { ...request.payment, status: 'paid' }, updatedAt }
    } else {
      requirePaid(request)
      if (request.stage === 'delivered') {
        if (input.action === 'deliver') return request
        fail('Delivered requests cannot be edited.', 409)
      }
      const selected = request.target
      if (
        !selected ||
        Object.values(selected).some((value) => value.includes('/'))
      )
        fail('Choose the exact Kitchen and Menu.', 400)
      await requireKitchenWriterAccount(
        { appId: actor.appId, kitchenId: selected.kitchenId },
        actor.uid,
        tx
      )
      if (input.action === 'review') {
        const review = await readKitchenMenuReview(
          tx,
          selected.kitchenId,
          selected.menuId
        )
        changes = { review, approval: null, stage: 'review', updatedAt }
      } else if (input.action === 'deliver') {
        if (request.stage !== 'approved' || !request.approval)
          fail('Customer approval is required before delivery.', 409)
        const current = await readKitchenMenuReview(
          tx,
          selected.kitchenId,
          selected.menuId
        )
        if (current.revision !== request.approval.revision)
          fail('Menu changed after approval. Send a new review.', 409)
        await stagePublishKitchenMenu(tx, {
          appId: actor.appId,
          uid: actor.uid,
          ...selected,
        })
        const menuPath = `/kitchens/${encodeURIComponent(current.kitchenSlug)}/menus/${encodeURIComponent(current.menuSlug)}`
        changes = {
          delivery: { menuPath, qrPath: `${menuPath}/qr` },
          stage: 'delivered',
          updatedAt,
        }
      } else return fail('Unknown operator action.')
    }
    tx.update(actor.target, id, changes)
    stageChatMessage(tx, {
      appId: actor.appId,
      conversationId: id,
      actor: { id: actor.uid, type: 'admin', name: 'Misebox operator' },
      body: `Menu Express: ${String(changes.stage || 'demo payment recorded')}`,
    })
    return dto(id, { ...record.data, ...changes })
  })
}
