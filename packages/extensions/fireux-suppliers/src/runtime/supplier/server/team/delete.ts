import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverSupplierTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './authority'
import { deleteTeamMember } from 'fireux-core/runtime/server/utils/workspace-team/members'
export async function deleteSupplierTeamMember(
  event: H3Event,
  input: { supplierId: string; memberId: string }
) {
  const id = requireFirestoreDocumentId(input.supplierId, 'Supplier id')
  const actor = await readSupplierMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireSupplierMutationAuthority(tx, actor, id)
    return deleteTeamMember(
      tx,
      serverSupplierTeamMembersTarget(id),
      input.memberId
    )
  })
}
