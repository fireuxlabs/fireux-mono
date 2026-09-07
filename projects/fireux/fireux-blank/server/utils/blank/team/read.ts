import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverBlankTeamMembersTarget } from './targets'
import {
  readBlankMutationActor,
  requireBlankMutationAuthority,
} from './authority'
import { enrichTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readBlankTeamMembers(
  event: H3Event,
  input: { blankId: string }
) {
  const blankId = requireFirestoreDocumentId(input?.blankId, 'Blank id')
  const actor = await readBlankMutationActor(event)
  const records = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requireBlankMutationAuthority(tx, actor, blankId)
      return tx.readAll<Record<string, unknown>>(
        serverBlankTeamMembersTarget(blankId),
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
    blankId,
    canManageTeam: true as const,
    members,
  }
}
