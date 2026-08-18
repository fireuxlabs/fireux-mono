import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenMemberInvitationsTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const text = (value: unknown) => String(value ?? '').trim()

export async function deleteKitchenTeamMember(
  event: H3Event,
  input: { kitchenId: string; memberId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const memberId = requireFirestoreDocumentId(input?.memberId, 'Team member id')
  const actor = await readKitchenMutationActor(event)
  let name = ''
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const members = serverKitchenTeamMembersTarget(
      kitchen.ownerAppId,
      kitchenId
    )
    const member = await mutations.read<Record<string, unknown>>(
      members,
      memberId
    )
    if (!member.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Team member not found.',
      })
    if (text(member.data?.user_id)) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Linked Team members cannot be deleted. Unlinking access requires a separate capability.',
      })
    }
    name = text(member.data?.name) || 'Team member'
    const invitations = serverKitchenMemberInvitationsTarget(
      kitchen.ownerAppId,
      kitchenId
    )
    const pending = await mutations.query<Record<string, unknown>>(
      invitations,
      {
        field: 'member_id',
        op: '==',
        value: memberId,
        limit: 20,
      }
    )
    for (const invitation of pending) {
      if (text(invitation.data.status) === 'pending') {
        mutations.update(invitations, invitation.id, {
          status: 'revoked',
          updated: serverAuditStamp({ by: actor.uid }),
        })
      }
    }
    mutations.delete(members, memberId)
  })
  return { ok: true as const, memberId, name }
}
