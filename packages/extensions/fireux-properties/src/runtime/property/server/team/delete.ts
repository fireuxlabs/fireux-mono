import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPropertyTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './authority'
import { deleteTeamMember } from 'fireux-core/runtime/server/utils/workspace-team/members'
export async function deletePropertyTeamMember(
  event: H3Event,
  input: { propertyId: string; memberId: string }
) {
  const id = requireFirestoreDocumentId(input.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePropertyMutationAuthority(tx, actor, id)
    return deleteTeamMember(
      tx,
      serverPropertyTeamMembersTarget(id),
      input.memberId
    )
  })
}
