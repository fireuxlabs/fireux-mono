import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBlankTeamMembersTarget } from './targets'
import {
  readBlankMutationActor,
  requireBlankMutationAuthority,
} from './authority'
import { createError } from 'h3'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
export type CreateBlankTeamMemberInput = {
  blankId: string
  name: string
  userId?: string
}
export type CreateBlankTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function createBlankTeamMember(
  event: H3Event,
  input: CreateBlankTeamMemberInput
): Promise<CreateBlankTeamMemberResult> {
  if (
    Object.keys(input || {}).some(
      (key) => !['blankId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input?.blankId, 'Blank id')
  const actor = await readBlankMutationActor(event)
  const member = await resolveTeamMemberInput(input)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const workspace = await requireBlankMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverBlankTeamMembersTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'blank.team',
          workspace.subscription,
          count
        ),
      limitMessage: `Your ${workspace.subscription} subscription has reached its Team member limit.`,
    })
  })
}
