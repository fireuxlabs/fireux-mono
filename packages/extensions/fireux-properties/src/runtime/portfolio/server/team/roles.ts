import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverPortfolioTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand, type TeamRolePolicy } from 'fireux-core/runtime/workspace/server/team/roles'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
const portfolioTeamRolePolicy = {
  fixedRoles: [
    { id: 'dev', name: 'Dev' },
    { id: 'operator', name: 'Operator' },
  ],
  fixedRoleRenameMessage: 'Dev and Operator are fixed roles.',
} as const satisfies TeamRolePolicy

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
      portfolioTeamRolePolicy
    )
  })
}
