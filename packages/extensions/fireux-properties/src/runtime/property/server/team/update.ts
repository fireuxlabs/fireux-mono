import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPropertyTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './authority'
import { updateTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
export async function updatePropertyTeamMember(
  event: H3Event,
  input: { propertyId: string; memberId: string; changes: { name: string } }
) {
  const id = requireFirestoreDocumentId(input.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePropertyMutationAuthority(tx, actor, id)
    const result = await updateTeamMembers(
      tx,
      serverPropertyTeamMembersTarget(id),
      [{ memberId: input.memberId, changes: input.changes }]
    )
    return {
      ok: true as const,
      memberId: result.updates[0]!.memberId,
      name: result.updates[0]!.changes.name,
    }
  })
}
