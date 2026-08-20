import type { ProjectCreateInput } from 'fireux-core/runtime/project/models/project.model'
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
  boundedProjectText,
  failProjectCommand,
  optionalProjectText,
  projectCommandRecord,
  projectStatus,
  requireProjectAdmin,
  resolveProjectCommandActor,
} from '../core/command'

export async function createProject(event: H3Event, input: unknown) {
  const body = projectCommandRecord(input, 'Project create request')
  const allowed = new Set(['id', 'name', 'description', 'image_url', 'status'])
  const unsupported = Object.keys(body).find((key) => !allowed.has(key))
  if (unsupported)
    failProjectCommand(
      400,
      `Project create contains unsupported field: ${unsupported}.`
    )
  const id = requireFirestoreDocumentId(body.id, 'Project id')
  const payload: ProjectCreateInput = {
    id,
    name: boundedProjectText(body.name, 'Project name', 120),
    description: optionalProjectText(
      body.description,
      'Project description',
      2000
    ),
    image_url: optionalProjectText(body.image_url, 'Project image URL', 2000),
    status: projectStatus(body.status, 'draft'),
  }
  const current = await resolveProjectCommandActor(event)
  const supports = fireuxAppProjectsTarget(current.appId)
  const targets = serverUserTargetsTarget(current.uid)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root, support, userTargets] = await Promise.all([
      mutations.read<Record<string, unknown>>(current.memberships, current.uid),
      mutations.read<Record<string, unknown>>(projects, id),
      mutations.read<Record<string, unknown>>(supports, id),
      mutations.read<Record<string, unknown>>(targets, 'targets'),
    ])
    requireProjectAdmin(membership.exists, membership.data)
    if (root.exists) failProjectCommand(409, 'Project already exists.')
    if (support.exists)
      failProjectCommand(
        409,
        'Project access exists without its canonical root.'
      )
    mutations.create(projects, id, {
      ...payload,
      created: serverAuditStamp({ by: current.uid, appId: current.appId }),
      updated: serverAuditStamp({ by: current.uid }),
    })
    mutations.create(supports, id, {
      operator_ids: [current.uid],
      team_ids: [current.uid],
      join_requests: [],
      created: serverAuditStamp({ by: current.uid, appId: current.appId }),
      updated: serverAuditStamp({ by: current.uid }),
    })
    const patch = {
      project_ids: FieldValue.arrayUnion(id),
      updated: serverAuditStamp({ by: current.uid }),
    }
    if (userTargets.exists) mutations.update(targets, 'targets', patch)
    else mutations.create(targets, 'targets', patch)
    mutations.update(current.memberships, current.uid, {
      workspace_enabled: true,
      updated: serverAuditStamp({ by: current.uid }),
    })
    return { ok: true as const, project_id: id }
  })
}
