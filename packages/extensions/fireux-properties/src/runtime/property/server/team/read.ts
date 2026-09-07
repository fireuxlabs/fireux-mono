import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverPropertyTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './authority'
import { enrichTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readPropertyTeamMembers(
  event: H3Event,
  input: { propertyId: string }
) {
  const id = requireFirestoreDocumentId(input.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requirePropertyMutationAuthority(tx, actor, id)
      return tx.readAll<Record<string, unknown>>(
        serverPropertyTeamMembersTarget(id),
        1000
      )
    }
  )
  return {
    ok: true as const,
    propertyId: id,
    canManageTeam: true as const,
    members: await enrichTeamMembers(records, getRuntimeIdentityFirestore()),
  }
}
