import { createHash } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { stageChatSessionCreation } from 'fireux-core/runtime/server/utils/chat/session'
import { requireChatStartBudget } from 'fireux-core/runtime/server/utils/chat/start-rate-limit'
import type { MenuExpressRequest } from '../../shared/types/menu-express'
import { context, operator, assertOperator, requireCustomer } from './authority'
import { dto, fail, intake, requestId } from './contract'

export async function createRequest(
  event: H3Event,
  input: Record<string, unknown>
) {
  const { appId, target } = context(event)
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail('Complete the request form.')
  const id = requestId(input.id),
    details = intake(input)
  const demo = input.demo === true
  const actor = demo ? await operator(event) : null
  if (demo && !import.meta.dev)
    fail('Demo requests are local-development only.', 404)
  requireChatStartBudget(event, appId)
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ details, demo }))
    .digest('hex')
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const existing = await tx.read(target, id)
    if (existing.exists) {
      await requireCustomer(tx, appId, id, input.token)
      if (existing.data?.intakeHash !== fingerprint)
        fail('This request already contains a different submission.', 409)
      return dto(id, existing.data!)
    }
    if (actor) await assertOperator(tx, appId, actor.uid)
    const now = Timestamp.now(),
      iso = now.toDate().toISOString()
    const data: Omit<MenuExpressRequest, 'id'> & { intakeHash: string } = {
      ...details,
      demo,
      intakeHash: fingerprint,
      stage: 'received',
      payment: { status: 'unpaid', sessionId: '', attempt: 0, priceId: '' },
      target: null,
      review: null,
      approval: null,
      correction: '',
      delivery: null,
      sources: [],
      createdAt: iso,
      updatedAt: iso,
    }
    const body = `Menu Express request: ${details.venue}\n${details.location}\n${details.sourceUrl}\n${details.instructions}`
    tx.create(target, id, data)
    stageChatSessionCreation(tx, {
      appId,
      conversationId: id,
      token: input.token,
      actor: { id: '', name: details.contact.name, type: 'guest' },
      contact: { ...details.contact, company: details.venue },
      body: body.slice(0, 4000),
      sourceRoute: '/menu-express',
      relatedEntity: {
        family: 'menu_express_requests',
        id,
        path: `${target.collectionPath}/${id}`,
        label: details.venue,
      },
    })
    return dto(id, data)
  })
}
