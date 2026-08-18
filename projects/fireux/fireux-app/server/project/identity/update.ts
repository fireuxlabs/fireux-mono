import type { ProjectUpdateInput } from 'fireux-core/runtime/models/system/project.model'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
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

export async function updateProject(
  event: H3Event,
  projectId: unknown,
  input: unknown
) {
  const id = requireFirestoreDocumentId(projectId, 'Project id')
  const body = projectCommandRecord(input, 'Project update request')
  const allowed = new Set(['name', 'description', 'image_url', 'status'])
  const unsupported = Object.keys(body).find((key) => !allowed.has(key))
  if (unsupported)
    failProjectCommand(
      400,
      `Project update contains unsupported field: ${unsupported}.`
    )
  const patch: ProjectUpdateInput = {}
  if ('name' in body)
    patch.name = boundedProjectText(body.name, 'Project name', 120)
  if ('description' in body)
    patch.description = optionalProjectText(
      body.description,
      'Project description',
      2000
    )
  if ('image_url' in body)
    patch.image_url = optionalProjectText(
      body.image_url,
      'Project image URL',
      2000
    )
  if ('status' in body) patch.status = projectStatus(body.status)
  if (!Object.keys(patch).length)
    failProjectCommand(400, 'Project update has no supported fields.')
  const current = await resolveProjectCommandActor(event)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root] = await Promise.all([
      mutations.read<Record<string, unknown>>(current.memberships, current.uid),
      mutations.read<Record<string, unknown>>(projects, id),
    ])
    requireProjectAdmin(membership.exists, membership.data)
    if (!root.exists) failProjectCommand(404, 'Project not found.')
    mutations.update(projects, id, {
      ...patch,
      updated: serverAuditStamp({ by: current.uid }),
    })
    return { ok: true as const, project_id: id }
  })
}
