import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverKitchenTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand, type TeamRolePolicy } from 'fireux-core/runtime/server/utils/workspace-team/roles'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
const kitchenTeamRolePolicy = {
  fixedRoles: [
    { id: 'dev', name: 'Dev' },
    { id: 'operator', name: 'Operator' },
  ],
  fixedRoleRenameMessage: 'Dev and Operator are fixed roles.',
} as const satisfies TeamRolePolicy

export async function kitchenRoles(
  event: H3Event,
  input: Record<string, unknown>
) {
  const id = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  const roles = defineFirestoreMutationTarget({
    key: 'kitchens.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${id}/roles`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, id)
    return teamRolesCommand(
      tx,
      roles,
      serverKitchenTeamMembersTarget(id),
      input,
      kitchenTeamRolePolicy
    )
  })
}
