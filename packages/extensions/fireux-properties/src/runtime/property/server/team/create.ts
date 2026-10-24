import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPropertyTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './authority'
import { createError } from 'h3'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
export async function createPropertyTeamMember(
  event: H3Event,
  input: { propertyId: string; name: string; userId?: string }
) {
  if (
    Object.keys(input || {}).some(
      (key) => !['propertyId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  const member = await resolveTeamMemberInput({
    name: input.name,
    userId: input.userId,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const scope = await requirePropertyMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverPropertyTeamMembersTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'property.team',
          scope.subscription,
          count
        ),
      limitMessage: 'Your subscription has reached its Team member limit.',
    })
  })
}
