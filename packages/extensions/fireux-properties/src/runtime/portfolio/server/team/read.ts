import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPortfolioTeamMembersTarget } from '../mutation-targets'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
import { enrichTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readPortfolioTeamMembers(
  event: H3Event,
  input: { portfolioId: string }
) {
  const id = requireFirestoreDocumentId(input.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requirePortfolioMutationAuthority(tx, actor, id)
      return tx.readAll<Record<string, unknown>>(
        serverPortfolioTeamMembersTarget(id),
        1000
      )
    }
  )
  return {
    ok: true as const,
    portfolioId: id,
    canManageTeam: true as const,
    members: await enrichTeamMembers(records, getRuntimeIdentityFirestore()),
  }
}
