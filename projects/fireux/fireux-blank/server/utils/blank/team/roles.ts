import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverBlankTeamMembersTarget } from './targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand, type TeamRolePolicy } from 'fireux-core/runtime/server/utils/workspace-team/roles'
import {
  readBlankMutationActor,
  requireBlankMutationAuthority,
} from './authority'
const blankTeamRolePolicy = {
  fixedRoles: [
    { id: 'dev', name: 'Dev' },
    { id: 'operator', name: 'Operator' },
  ],
  fixedRoleRenameMessage: 'Dev and Operator are fixed roles.',
} as const satisfies TeamRolePolicy

export async function blankRoles(
  event: H3Event,
  input: Record<string, unknown>
) {
  const id = requireFirestoreDocumentId(input.blankId, 'Blank id')
  const actor = await readBlankMutationActor(event)
  const roles = defineFirestoreMutationTarget({
    key: 'blanks.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `blanks/${id}/roles`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBlankMutationAuthority(tx, actor, id)
    return teamRolesCommand(
      tx,
      roles,
      serverBlankTeamMembersTarget(id),
      input,
      blankTeamRolePolicy
    )
  })
}
