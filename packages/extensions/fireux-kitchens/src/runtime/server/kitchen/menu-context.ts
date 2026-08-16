import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from './mutation-authority.ts'

const CONTEXT_MAX_LENGTH = 6_000
const CURRENT_MENU_PREFIX = 'Current Menu records: '

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const mergeCurrentMenuSummary = (context: string, summary: string) => {
  const retained = context
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith(CURRENT_MENU_PREFIX))
  return [...retained, `${CURRENT_MENU_PREFIX}${summary}`].join('\n')
}

export async function saveKitchenMenuSummaryContext(
  event: H3Event,
  input: { kitchenId: unknown; summary: unknown }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const summary = text(input.summary)
  if (!summary) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A current Menu summary is required.',
    })
  }

  const actor = await readKitchenMutationActor(event)
  let context = ''
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const current = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const menus = record(record(current.supportData.console).menus)
    context = mergeCurrentMenuSummary(text(menus.context), summary)
    if (context.length > CONTEXT_MAX_LENGTH) {
      throw createError({
        statusCode: 400,
        statusMessage: `Menu context must not exceed ${CONTEXT_MAX_LENGTH} characters.`,
      })
    }
    mutations.update(current.supports, kitchenId, {
      'console.menus.context': context,
      updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
    })
  })

  return { context }
}
