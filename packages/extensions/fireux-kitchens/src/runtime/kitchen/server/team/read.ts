import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenTeamMembersTarget } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { enrichTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readKitchenTeamMembers(
  event: H3Event,
  input: { kitchenId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requireKitchenMutationAuthority(tx, actor, kitchenId)
      return tx.readAll<Record<string, unknown>>(
        serverKitchenTeamMembersTarget(kitchenId),
        200
      )
    }
  )
  const members = await enrichTeamMembers(
    records,
    getRuntimeIdentityFirestore()
  )
  return { ok: true as const, kitchenId, canManageTeam: true as const, members }
}
