import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverSupplierTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './authority'
import { enrichTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readSupplierTeamMembers(
  event: H3Event,
  input: { supplierId: string }
) {
  const supplierId = requireFirestoreDocumentId(
    input?.supplierId,
    'Supplier id'
  )
  const actor = await readSupplierMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requireSupplierMutationAuthority(tx, actor, supplierId)
      return tx.readAll<Record<string, unknown>>(
        serverSupplierTeamMembersTarget(supplierId),
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
    supplierId,
    canManageTeam: true as const,
    members,
  }
}
