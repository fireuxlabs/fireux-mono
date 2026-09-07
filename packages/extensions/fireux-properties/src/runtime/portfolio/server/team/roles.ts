import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverPortfolioTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand } from 'fireux-core/runtime/server/utils/workspace-team/roles'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
export async function portfolioRoles(
  event: H3Event,
  input: Record<string, unknown>
) {
  const id = requireFirestoreDocumentId(input.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  const roles = defineFirestoreMutationTarget({
    key: 'portfolios.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `portfolios/${id}/roles`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePortfolioMutationAuthority(tx, actor, id)
    return teamRolesCommand(
      tx,
      roles,
      serverPortfolioTeamMembersTarget(id),
      input,
      actor.uid
    )
  })
}
