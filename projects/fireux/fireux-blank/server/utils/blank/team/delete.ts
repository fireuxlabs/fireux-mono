import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBlankTeamMembersTarget } from './targets'
import {
  readBlankMutationActor,
  requireBlankMutationAuthority,
} from './authority'
import { deleteTeamMember } from 'fireux-core/runtime/workspace/server/team/members'
export async function deleteBlankTeamMember(
  event: H3Event,
  input: { blankId: string; memberId: string }
) {
  const id = requireFirestoreDocumentId(input.blankId, 'Blank id')
  const actor = await readBlankMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBlankMutationAuthority(tx, actor, id)
    return deleteTeamMember(
      tx,
      serverBlankTeamMembersTarget(id),
      input.memberId
    )
  })
}
