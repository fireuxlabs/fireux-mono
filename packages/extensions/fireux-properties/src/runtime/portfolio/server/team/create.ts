import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPortfolioTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from './authority'
import { createError } from 'h3'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
export async function createPortfolioTeamMember(
  event: H3Event,
  input: { portfolioId: string; name: string; userId?: string }
) {
  if (
    Object.keys(input || {}).some(
      (key) => !['portfolioId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input.portfolioId, 'Portfolio id')
  const actor = await readPortfolioMutationActor(event)
  const member = await resolveTeamMemberInput({
    name: input.name,
    userId: input.userId,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const scope = await requirePortfolioMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverPortfolioTeamMembersTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'portfolio.team',
          scope.subscription,
          count
        ),
      limitMessage: 'Your subscription has reached its Team member limit.',
    })
  })
}
