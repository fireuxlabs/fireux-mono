import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBusinessTeamTarget } from '../mutation-targets'
import {
  readBusinessMutationActor,
  requireBusinessMutationAuthority,
} from './authority'
import { createError } from 'h3'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
export type CreateBusinessTeamMemberInput = {
  businessId: string
  name: string
  userId?: string
}
export type CreateBusinessTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function createBusinessTeamMember(
  event: H3Event,
  input: CreateBusinessTeamMemberInput
): Promise<CreateBusinessTeamMemberResult> {
  if (
    Object.keys(input || {}).some(
      (key) => !['businessId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input?.businessId, 'Business id')
  const actor = await readBusinessMutationActor(event)
  const member = await resolveTeamMemberInput(input)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const workspace = await requireBusinessMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverBusinessTeamTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'business.team',
          workspace.subscription,
          count
        ),
      limitMessage: `Your ${workspace.subscription} subscription has reached its Team member limit.`,
    })
  })
}
