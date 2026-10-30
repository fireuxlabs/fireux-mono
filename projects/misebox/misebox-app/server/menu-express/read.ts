import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readChatSession } from 'fireux-core/runtime/server/utils/chat/session'
import { context, operator, assertOperator, requireCustomer } from './authority'
import { dto, fail, requestId } from './contract'

export async function readRequest(
  event: H3Event,
  rawId: unknown,
  input: Record<string, unknown>
) {
  const id = requestId(rawId),
    { appId, target } = context(event)
  const actor = input.operator === true ? await operator(event) : null
  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      if (actor) await assertOperator(tx, appId, actor.uid)
      else await requireCustomer(tx, appId, id, input.token)
      const record = await tx.read(target, id)
      if (!record.exists) fail('Request not found.', 404)
      return dto(id, record.data!)
    }
  )
  const chat = await readChatSession(event, {
    conversation_id: id,
    token: input.token,
  })
  return { request: result, messages: chat.messages }
}
