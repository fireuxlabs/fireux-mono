import { fireuxProjectTeamMembersTarget } from '../targets'
import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  teamRolesCommand,
  type TeamRolePolicy,
} from 'fireux-core/runtime/server/utils/workspace-team/roles'
import {
  requireProjectOperator,
  requireProjectOperatorInTransaction,
} from '../authority'
const projectTeamRolePolicy = {
  fixedRoles: [
    { id: 'dev', name: 'Dev' },
    { id: 'operator', name: 'Operator' },
  ],
  fixedRoleRenameMessage: 'Dev and Operator are fixed roles.',
} as const satisfies TeamRolePolicy

export async function projectRoles(
  event: H3Event,
  projectIdInput: unknown,
  input: Record<string, unknown>
) {
  const actor = await requireProjectOperator(event, projectIdInput)
  const { projectId } = actor
  const members = fireuxProjectTeamMembersTarget(projectId)
  const roles = defineFirestoreMutationTarget({
    key: 'projects.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: members.database,
    collectionPath: `projects/${projectId}/roles`,
  })
  return runGuardedServerTransaction(members.database, async (tx) => {
    await requireProjectOperatorInTransaction(tx, actor)
    return teamRolesCommand(tx, roles, members, input, projectTeamRolePolicy)
  })
}
