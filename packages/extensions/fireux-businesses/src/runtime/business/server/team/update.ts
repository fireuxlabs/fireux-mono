import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBusinessTeamTarget } from '../mutation-targets'
import {
  readBusinessMutationActor,
  requireBusinessMutationAuthority,
} from './authority'
import { updateTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
export type BusinessTeamMemberChanges = { name: string }
export type BusinessTeamMemberUpdate = {
  memberId: string
  changes: BusinessTeamMemberChanges
}
export type UpdateBusinessTeamMemberInput = BusinessTeamMemberUpdate & {
  businessId: string
}
export type UpdateBusinessTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function updateBusinessTeamMember(
  event: H3Event,
  input: UpdateBusinessTeamMemberInput
): Promise<UpdateBusinessTeamMemberResult> {
  const result = await updateBusinessTeamMembers(event, {
    businessId: input.businessId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  return {
    ok: true,
    memberId: result.updates[0]!.memberId,
    name: result.updates[0]!.changes.name,
  }
}
export async function updateBusinessTeamMembers(
  event: H3Event,
  input: { businessId: string; updates: BusinessTeamMemberUpdate[] }
) {
  const id = requireFirestoreDocumentId(input.businessId, 'Business id')
  const actor = await readBusinessMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBusinessMutationAuthority(tx, actor, id)
    return updateTeamMembers(
      tx,
      serverBusinessTeamTarget(id),
      input.updates
    )
  })
}
