import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { updateTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
export type KitchenTeamMemberChanges = { name: string }
export type KitchenTeamMemberUpdate = {
  memberId: string
  changes: KitchenTeamMemberChanges
}
export type UpdateKitchenTeamMemberInput = KitchenTeamMemberUpdate & {
  kitchenId: string
}
export type UpdateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function updateKitchenTeamMember(
  event: H3Event,
  input: UpdateKitchenTeamMemberInput
): Promise<UpdateKitchenTeamMemberResult> {
  const result = await updateKitchenTeamMembers(event, {
    kitchenId: input.kitchenId,
    updates: [{ memberId: input.memberId, changes: input.changes }],
  })
  return {
    ok: true,
    memberId: result.updates[0]!.memberId,
    name: result.updates[0]!.changes.name,
  }
}
export async function updateKitchenTeamMembers(
  event: H3Event,
  input: { kitchenId: string; updates: KitchenTeamMemberUpdate[] }
) {
  const id = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, id)
    return updateTeamMembers(
      tx,
      serverKitchenTeamMembersTarget(id),
      input.updates
    )
  })
}
