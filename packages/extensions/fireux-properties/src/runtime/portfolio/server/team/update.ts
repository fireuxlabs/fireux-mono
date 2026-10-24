import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPortfolioTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
import { updateTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
export async function updatePortfolioTeamMember(
  event: H3Event,
  input: { portfolioId: string; memberId: string; changes: { name: string } }
) {
  const id = requireFirestoreDocumentId(input.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePortfolioMutationAuthority(tx, actor, id)
    const result = await updateTeamMembers(
      tx,
      serverPortfolioTeamMembersTarget(id),
      [{ memberId: input.memberId, changes: input.changes }]
    )
    return {
      ok: true as const,
      memberId: result.updates[0]!.memberId,
      name: result.updates[0]!.changes.name,
    }
  })
}
