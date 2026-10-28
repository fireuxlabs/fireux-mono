import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PORTFOLIO_MUTATION_TARGETS } from './mutation-targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import {
  readContextRequest,
  contextChange,
} from 'fireux-core/runtime/server/utils/records/context'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './team/authority'

export async function portfolioContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  const value = readContextRequest(input, ['portfolioId'], write)
  const id = requireFirestoreDocumentId(value.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requirePortfolioMutationAuthority(tx, actor, id)
    const current = readRecordString(rootData, 'context')
    if (!write) return { context: current }
    const context = contextChange(value, current)
    tx.update(PORTFOLIO_MUTATION_TARGETS.portfolios, id, {
      context,
      updated: serverAuditStamp({ by: actor.uid }),
    })
    return { context }
  })
}
