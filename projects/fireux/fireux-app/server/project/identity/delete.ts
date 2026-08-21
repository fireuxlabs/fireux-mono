import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxProjectTeamMembersTarget,
  serverUserTargetsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { FieldValue } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import {
  failProjectCommand,
  requireProjectAdmin,
  resolveProjectCommandActor,
} from '../core/command'

export async function deleteProject(event: H3Event, projectId: unknown) {
  const id = requireFirestoreDocumentId(projectId, 'Project id')
  const current = await resolveProjectCommandActor(event)
  const team = fireuxProjectTeamMembersTarget(id)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root, currentTeamMember, teamMembers, apps, ecosystems] =
      await Promise.all([
        mutations.read<Record<string, unknown>>(
          current.memberships,
          current.uid
        ),
        mutations.read<Record<string, unknown>>(projects, id),
        mutations.read<Record<string, unknown>>(team, current.uid),
        mutations.readAll<Record<string, unknown>>(team, 150),
        mutations.query(FIRESTORE_MUTATION_TARGETS.fireuxApps, {
          field: 'project_id',
          op: '==',
          value: id,
          limit: 1,
        }),
        mutations.query(FIRESTORE_MUTATION_TARGETS.fireuxEcosystems, {
          field: 'project_id',
          op: '==',
          value: id,
          limit: 1,
        }),
      ])
    requireProjectAdmin(membership.exists, membership.data)
    if (!root.exists) failProjectCommand(404, 'Project not found.')
    const currentTeamRole = String(currentTeamMember.data?.role || '').trim()
    if (
      !currentTeamMember.exists ||
      String(currentTeamMember.data?.user_id || '').trim() !== current.uid ||
      String(currentTeamMember.data?.status || '').trim() !== 'active' ||
      (currentTeamRole !== 'owner' && currentTeamRole !== 'operator')
    ) {
      failProjectCommand(403, 'Active Project Team authority is required.')
    }
    if (apps.length || ecosystems.length)
      failProjectCommand(
        409,
        'Project must have no Apps or Ecosystems before deletion.'
      )
    const userIds = teamMembers.map((member) => member.id)
    const targetRecords = await Promise.all(
      userIds.map((uid) =>
        mutations.read<Record<string, unknown>>(
          serverUserTargetsTarget(uid),
          'targets'
        )
      )
    )
    userIds.forEach((uid, index) => {
      if (targetRecords[index]?.exists)
        mutations.update(serverUserTargetsTarget(uid), 'targets', {
          project_ids: FieldValue.arrayRemove(id),
          updated: serverAuditStamp({ by: current.uid }),
        })
    })
    teamMembers.forEach((member) => mutations.delete(team, member.id))
    mutations.delete(projects, id)
    return { ok: true as const, project_id: id }
  })
}
