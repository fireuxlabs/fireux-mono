import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { createError } from 'h3'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
export type CreateKitchenTeamMemberInput = {
  kitchenId: string
  name: string
  userId?: string
}
export type CreateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function createKitchenTeamMember(
  event: H3Event,
  input: CreateKitchenTeamMemberInput
): Promise<CreateKitchenTeamMemberResult> {
  if (
    Object.keys(input || {}).some(
      (key) => !['kitchenId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  const member = await resolveTeamMemberInput(input)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const workspace = await requireKitchenMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverKitchenTeamMembersTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'kitchen.team',
          workspace.subscription,
          count
        ),
      limitMessage: `Your ${workspace.subscription} subscription has reached its Team member limit.`,
    })
  })
}
