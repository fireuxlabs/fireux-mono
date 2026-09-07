import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBlankTeamMembersTarget } from './targets'
import {
  readBlankMutationActor,
  requireBlankMutationAuthority,
} from './authority'
import { updateTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
export type BlankTeamMemberChanges = { name: string }
export type BlankTeamMemberUpdate = {
  memberId: string
  changes: BlankTeamMemberChanges
}
export type UpdateBlankTeamMemberInput = BlankTeamMemberUpdate & {
  blankId: string
}
export type UpdateBlankTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function updateBlankTeamMember(
  event: H3Event,
  input: UpdateBlankTeamMemberInput
): Promise<UpdateBlankTeamMemberResult> {
  const result = await updateBlankTeamMembers(event, {
    blankId: input.blankId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  return {
    ok: true,
    memberId: result.updates[0]!.memberId,
    name: result.updates[0]!.changes.name,
  }
}
export async function updateBlankTeamMembers(
  event: H3Event,
  input: { blankId: string; updates: BlankTeamMemberUpdate[] }
) {
  const id = requireFirestoreDocumentId(input.blankId, 'Blank id')
  const actor = await readBlankMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBlankMutationAuthority(tx, actor, id)
    return updateTeamMembers(
      tx,
      serverBlankTeamMembersTarget(id),
      input.updates
    )
  })
}
