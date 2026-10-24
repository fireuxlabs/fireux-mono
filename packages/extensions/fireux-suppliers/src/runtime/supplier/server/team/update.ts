import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverSupplierTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './authority'
import { updateTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
export type SupplierTeamMemberChanges = { name: string }
export type SupplierTeamMemberUpdate = {
  memberId: string
  changes: SupplierTeamMemberChanges
}
export type UpdateSupplierTeamMemberInput = SupplierTeamMemberUpdate & {
  supplierId: string
}
export type UpdateSupplierTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function updateSupplierTeamMember(
  event: H3Event,
  input: UpdateSupplierTeamMemberInput
): Promise<UpdateSupplierTeamMemberResult> {
  const result = await updateSupplierTeamMembers(event, {
    supplierId: input.supplierId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  return {
    ok: true,
    memberId: result.updates[0]!.memberId,
    name: result.updates[0]!.changes.name,
  }
}
export async function updateSupplierTeamMembers(
  event: H3Event,
  input: { supplierId: string; updates: SupplierTeamMemberUpdate[] }
) {
  const id = requireFirestoreDocumentId(input.supplierId, 'Supplier id')
  const actor = await readSupplierMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireSupplierMutationAuthority(tx, actor, id)
    return updateTeamMembers(
      tx,
      serverSupplierTeamMembersTarget(id),
      input.updates
    )
  })
}
