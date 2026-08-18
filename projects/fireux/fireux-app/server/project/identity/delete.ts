import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppProjectsTarget,
  serverUserTargetsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { FieldValue } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import {
  failProjectCommand,
  projectAccessIds,
  requireProjectAdmin,
  resolveProjectCommandActor,
} from '../core/command'

export async function deleteProject(event: H3Event, projectId: unknown) {
  const id = requireFirestoreDocumentId(projectId, 'Project id')
  const current = await resolveProjectCommandActor(event)
  const supports = fireuxAppProjectsTarget(current.appId)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root, support, apps, ecosystems] = await Promise.all([
      mutations.read<Record<string, unknown>>(current.memberships, current.uid),
      mutations.read<Record<string, unknown>>(projects, id),
      mutations.read<Record<string, unknown>>(supports, id),
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
    if (apps.length || ecosystems.length)
      failProjectCommand(
        409,
        'Project must have no Apps or Ecosystems before deletion.'
      )
    const userIds = projectAccessIds(support.data)
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
    if (support.exists) mutations.delete(supports, id)
    mutations.delete(projects, id)
    return { ok: true as const, project_id: id }
  })
}
