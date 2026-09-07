import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverPropertyTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand } from 'fireux-core/runtime/server/utils/workspace-team/roles'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './authority'
export async function propertyRoles(
  event: H3Event,
  input: Record<string, unknown>
) {
  const id = requireFirestoreDocumentId(input.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  const roles = defineFirestoreMutationTarget({
    key: 'properties.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `properties/${id}/roles`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requirePropertyMutationAuthority(tx, actor, id)
    return teamRolesCommand(
      tx,
      roles,
      serverPropertyTeamMembersTarget(id),
      input,
      actor.uid
    )
  })
}
