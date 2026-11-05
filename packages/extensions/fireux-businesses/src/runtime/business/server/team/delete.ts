import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBusinessTeamTarget } from '../mutation-targets'
import {
  readBusinessMutationActor,
  requireBusinessMutationAuthority,
} from './authority'
import { deleteTeamMember } from 'fireux-core/runtime/workspace/server/team/members'
export async function deleteBusinessTeamMember(
  event: H3Event,
  input: { businessId: string; memberId: string }
) {
  const id = requireFirestoreDocumentId(input.businessId, 'Business id')
  const actor = await readBusinessMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBusinessMutationAuthority(tx, actor, id)
    return deleteTeamMember(
      tx,
      serverBusinessTeamTarget(id),
      input.memberId
    )
  })
}
