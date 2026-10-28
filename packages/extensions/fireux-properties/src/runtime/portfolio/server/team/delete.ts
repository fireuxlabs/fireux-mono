import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPortfolioTeamMembersTarget } from '../mutation-targets'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
import { deleteTeamMember } from 'fireux-core/runtime/workspace/server/team/members'
export async function deletePortfolioTeamMember(
  event: H3Event,
  input: { portfolioId: string; memberId: string }
) {
  const id = requireFirestoreDocumentId(input.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePortfolioMutationAuthority(tx, actor, id)
    return deleteTeamMember(
      tx,
      serverPortfolioTeamMembersTarget(id),
      input.memberId
    )
  })
}
