import type { H3Event } from 'h3'
import { deleteTeamMember } from 'fireux-core/runtime/workspace/server/team/members'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenTeamMembersTarget } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'
import { serverKitchenMemberInvitationsTarget } from './mutation-targets.ts'
import { readKitchenMemberInvitationHistory } from './invitation-history.ts'

export async function deleteKitchenTeamMember(
  event: H3Event,
  input: { kitchenId: string; memberId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const memberId = requireFirestoreDocumentId(input?.memberId, 'Team member id')
  const actor = await readKitchenMutationActor(event)
  let name = ''
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const members = serverKitchenTeamMembersTarget(kitchenId)
    const invitations = serverKitchenMemberInvitationsTarget(kitchenId)
    const { pendingIds } = await readKitchenMemberInvitationHistory(
      mutations,
      invitations,
      memberId
    )
    name = (await deleteTeamMember(mutations, members, memberId)).name
    for (const id of pendingIds) {
      mutations.update(invitations, id, {
        status: 'revoked',
        updated: serverAuditStamp({ by: actor.uid }),
      })
    }
  })
  return { ok: true as const, memberId, name }
}
