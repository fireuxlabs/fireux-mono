import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type {
  ProjectCreateInput,
  ProjectStatus,
  ProjectUpdateInput,
} from 'fireux-core/runtime/models/system/project.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppProjectsTarget,
  fireuxAppUsersTarget,
  serverUserTargetsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'

const PROJECT_STATUSES = new Set<ProjectStatus>([
  'draft',
  'active',
  'paused',
  'archived',
])

const text = (value: unknown) => String(value ?? '').trim()
const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage })
}

function record(value: unknown, label: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, `${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function boundedText(value: unknown, label: string, max: number) {
  const result = text(value)
  if (!result || result.length > max) {
    fail(400, `${label} must contain between 1 and ${max} characters.`)
  }
  return result
}

function optionalText(value: unknown, label: string, max: number) {
  const result = text(value)
  if (result.length > max)
    fail(400, `${label} must contain at most ${max} characters.`)
  return result
}

function status(value: unknown, fallback?: ProjectStatus) {
  const result = text(value) as ProjectStatus
  if (!result && fallback) return fallback
  if (!PROJECT_STATUSES.has(result)) fail(400, 'Project status is invalid.')
  return result
}

async function authority(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'Runtime App id'
  )
  return { uid, appId }
}

function requireAdmin(
  exists: boolean,
  data: Record<string, unknown> | undefined
) {
  if (!exists || text(data?.role) !== 'admin') {
    fail(403, 'A FireUX App admin is required to manage Projects.')
  }
}

function accessIds(data: Record<string, unknown> | undefined) {
  const values = [
    ...(Array.isArray(data?.operator_ids) ? data.operator_ids : []),
    ...(Array.isArray(data?.team_ids) ? data.team_ids : []),
  ]
  const ids = values.map(text).filter(Boolean)
  if (ids.some((id) => id.includes('/')) || ids.length > 150) {
    fail(409, 'Project App support has invalid access ids.')
  }
  return [...new Set(ids)]
}

export async function createProject(event: H3Event, input: unknown) {
  const body = record(input, 'Project create request')
  const allowed = new Set(['id', 'name', 'description', 'image_url', 'status'])
  const unsupported = Object.keys(body).find((key) => !allowed.has(key))
  if (unsupported)
    fail(400, `Project create contains unsupported field: ${unsupported}.`)
  const id = requireFirestoreDocumentId(body.id, 'Project id')
  const payload: ProjectCreateInput = {
    id,
    name: boundedText(body.name, 'Project name', 120),
    description: optionalText(body.description, 'Project description', 2000),
    image_url: optionalText(body.image_url, 'Project image URL', 2000),
    status: status(body.status, 'draft'),
  }
  const current = await authority(event)
  const memberships = fireuxAppUsersTarget(current.appId)
  const supports = fireuxAppProjectsTarget(current.appId)
  const targets = serverUserTargetsTarget(current.uid)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects

  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root, support, userTargets] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, current.uid),
      mutations.read<Record<string, unknown>>(projects, id),
      mutations.read<Record<string, unknown>>(supports, id),
      mutations.read<Record<string, unknown>>(targets, 'targets'),
    ])
    requireAdmin(membership.exists, membership.data)
    if (root.exists) fail(409, 'Project already exists.')
    if (support.exists)
      fail(409, 'Project access exists without its canonical root.')

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
    const targetPatch = {
      project_ids: FieldValue.arrayUnion(id),
      updated: serverAuditStamp({ by: current.uid }),
    }
    if (userTargets.exists) mutations.update(targets, 'targets', targetPatch)
    else mutations.create(targets, 'targets', targetPatch)
    mutations.update(memberships, current.uid, {
      console_enabled: true,
      updated: serverAuditStamp({ by: current.uid }),
    })
    return { ok: true as const, project_id: id }
  })
}

export async function updateProject(
  event: H3Event,
  projectId: unknown,
  input: unknown
) {
  const id = requireFirestoreDocumentId(projectId, 'Project id')
  const body = record(input, 'Project update request')
  const allowed = new Set(['name', 'description', 'image_url', 'status'])
  const unsupported = Object.keys(body).find((key) => !allowed.has(key))
  if (unsupported)
    fail(400, `Project update contains unsupported field: ${unsupported}.`)
  const patch: ProjectUpdateInput = {}
  if ('name' in body) patch.name = boundedText(body.name, 'Project name', 120)
  if ('description' in body)
    patch.description = optionalText(
      body.description,
      'Project description',
      2000
    )
  if ('image_url' in body)
    patch.image_url = optionalText(body.image_url, 'Project image URL', 2000)
  if ('status' in body) patch.status = status(body.status)
  if (!Object.keys(patch).length)
    fail(400, 'Project update has no supported fields.')
  const current = await authority(event)
  const memberships = fireuxAppUsersTarget(current.appId)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, current.uid),
      mutations.read<Record<string, unknown>>(projects, id),
    ])
    requireAdmin(membership.exists, membership.data)
    if (!root.exists) fail(404, 'Project not found.')
    mutations.update(projects, id, {
      ...patch,
      updated: serverAuditStamp({ by: current.uid }),
    })
    return { ok: true as const, project_id: id }
  })
}

export async function deleteProject(event: H3Event, projectId: unknown) {
  const id = requireFirestoreDocumentId(projectId, 'Project id')
  const current = await authority(event)
  const memberships = fireuxAppUsersTarget(current.appId)
  const supports = fireuxAppProjectsTarget(current.appId)
  const projects = FIRESTORE_MUTATION_TARGETS.fireuxProjects
  return runGuardedServerTransaction(projects.database, async (mutations) => {
    const [membership, root, support, apps, ecosystems] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, current.uid),
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
    requireAdmin(membership.exists, membership.data)
    if (!root.exists) fail(404, 'Project not found.')
    if (apps.length || ecosystems.length)
      fail(409, 'Project must have no Apps or Ecosystems before deletion.')
    const userIds = accessIds(support.data)
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
