import { fireuxProjectTeamMembersTarget } from 'fireux-fireux/runtime/project/server/targets'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/server/utils/workspace-team/members'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireProjectOperator } from '../core/authority'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'

export async function createProjectTeamMember(
  event: H3Event,
  projectIdInput: unknown,
  input: unknown
) {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  if (Object.keys(source).some((key) => key !== 'name' && key !== 'userId')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  }
  const { projectId, membership } = await requireProjectOperator(
    event,
    projectIdInput
  )
  const member = await resolveTeamMemberInput({
    name: source.name,
    userId: source.userId,
  })
  const team = fireuxProjectTeamMembersTarget(projectId)
  const capacity = useFireUXConfig(event).subscriptionCapacity
  const subscription = membership.subscription
  if (!isAppUserSubscription(subscription))
    throw createError({
      statusCode: 409,
      statusMessage: 'Invalid subscription.',
    })
  return runGuardedServerTransaction(team.database, (tx) =>
    createTeamMember(tx, team, member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          capacity,
          'project.team',
          subscription,
          count
        ),
      limitMessage: 'Your subscription has reached its Team member limit.',
    })
  )
}
