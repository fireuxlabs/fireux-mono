import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBusinessTeamTarget } from '../mutation-targets'
import {
  readBusinessMutationActor,
  requireBusinessMutationAuthority,
} from './authority'
import { enrichTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readBusinessTeamMembers(
  event: H3Event,
  input: { businessId: string }
) {
  const businessId = requireFirestoreDocumentId(input?.businessId, 'Business id')
  const actor = await readBusinessMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requireBusinessMutationAuthority(tx, actor, businessId)
      return tx.readAll<Record<string, unknown>>(
        serverBusinessTeamTarget(businessId),
        200
      )
    }
  )
  const members = await enrichTeamMembers(
    records,
    getRuntimeIdentityFirestore()
  )
  return {
    ok: true as const,
    businessId,
    canManageTeam: true as const,
    members,
  }
}
