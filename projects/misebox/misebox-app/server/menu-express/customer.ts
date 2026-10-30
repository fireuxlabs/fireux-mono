import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { stageChatMessage } from 'fireux-core/runtime/server/utils/chat/session'
import { readKitchenMenuReview } from 'fireux-kitchens/runtime/menu/server/publication/review'
import { context, requireCustomer } from './authority'
import { dto, fail, requestId, requireReview, text } from './contract'

export async function customerAction(
  event: H3Event,
  rawId: unknown,
  input: Record<string, unknown>
) {
  const id = requestId(rawId),
    { appId, target } = context(event)
  const note =
    input.action === 'correction' ? text(input.note, 'Correction', 2000) : ''
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireCustomer(tx, appId, id, input.token, true)
    const record = await tx.read(target, id)
    if (!record.exists) fail('Request not found.', 404)
    const request = dto(id, record.data!)
    if (
      input.action === 'approve' &&
      ['approved', 'delivered'].includes(request.stage) &&
      request.approval?.revision === input.revision
    )
      return request
    if (
      input.action === 'correction' &&
      request.stage === 'preparing' &&
      request.correction === note
    )
      return request
    requireReview(request, input.revision)
    if (!request.target) fail('No prepared Menu is linked.', 409)
    const current = await readKitchenMenuReview(
      tx,
      request.target.kitchenId,
      request.target.menuId
    )
    if (current.revision !== request.review!.revision)
      fail('The Menu changed. The operator must send a new review.', 409)
    const updatedAt = new Date().toISOString()
    const changes =
      input.action === 'approve'
        ? {
            stage: 'approved',
            approval: { revision: current.revision, at: updatedAt },
            updatedAt,
          }
        : input.action === 'correction'
          ? { stage: 'preparing', correction: note, approval: null, updatedAt }
          : fail('Unknown customer action.')
    tx.update(target, id, changes)
    stageChatMessage(tx, {
      appId,
      conversationId: id,
      actor: { id: '', type: 'guest', name: request.contact.name },
      body:
        input.action === 'approve'
          ? `Approved Menu revision ${current.revision}`
          : note,
    })
    return dto(id, { ...record.data, ...changes })
  })
}
