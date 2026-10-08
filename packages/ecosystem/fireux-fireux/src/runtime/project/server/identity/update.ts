import { fireuxProjectsTarget } from '../targets'
import { readProjectDocument } from '../../utils/readProject'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { serverProjectAccessTarget } from '../access'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { hasProjectAppContext } from '../../utils/app-context-connection'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function identityPatch(value: unknown, connected: boolean) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'Project Identity changes must be an object.')
  const source = value as Record<string, unknown>
  const keys = Object.keys(source)
  if (
    !keys.length ||
    keys.some((key) => !['name', 'description', 'image_url'].includes(key))
  )
    fail(400, 'Only Project Identity fields may be updated.')
  if (connected && keys.some((key) => key !== 'name'))
    fail(403, 'Description and image are managed by the connected App.')
  const patch: Record<string, string> = {}
  for (const key of keys) {
    if (typeof source[key] !== 'string')
      fail(400, 'Project Identity fields must be text.')
    const raw = (source[key] as string).trim()
    const value = key === 'name' ? raw.replace(/\s+/g, ' ') : raw
    if (key === 'name' && (!value || value.length > 120))
      fail(400, 'Enter a name of 1–120 characters.')
    if (key === 'description' && value.length > 2000)
      fail(400, 'Description must be 2,000 characters or fewer.')
    if (key === 'image_url' && value) {
      let url: URL
      try {
        url = new URL(value)
      } catch {
        return fail(400, 'Enter a complete HTTPS image URL, or leave it empty.')
      }
      if (
        value.length > 2048 ||
        url.protocol !== 'https:' ||
        url.username ||
        url.password
      )
        fail(
          400,
          'Use an HTTPS image URL without credentials, up to 2,048 characters.'
        )
    }
    patch[`identity.${key}`] = value
  }
  return patch
}

/** Project operator authority and the write share the same transaction snapshot. */
export async function updateProjectIdentity(
  event: H3Event,
  rawProjectId: unknown,
  input: unknown
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const projectId = requireFirestoreDocumentId(rawProjectId, 'Project id')
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'FireUX App id'
  )
  const patch = identityPatch(input, hasProjectAppContext(projectId))
  const memberships = fireuxAppUsersTarget(appId)
  const accessTarget = serverProjectAccessTarget(appId)
  await runGuardedServerTransaction(
    { kind: 'named', databaseId: 'fireux' },
    async (transaction) => {
      const [app, membership, access, project] = await Promise.all([
        transaction.read(FIRESTORE_MUTATION_TARGETS.fireuxApps, appId),
        transaction.read(memberships, uid),
        transaction.read(accessTarget, uid),
        transaction.read(fireuxProjectsTarget, projectId),
      ])
      if (!app.exists) fail(403, 'FireUX App membership is required.')
      requireWorkspaceEntityMemberRole({
        exists: membership.exists,
        role: membership.data?.role,
        entityLabel: 'Project',
      })
      if (
        !readMembershipAccessIds(access.data, membership.data).includes(
          projectId
        )
      )
        fail(403, 'Project membership is required.')
      if (!project.exists) fail(404, 'Project was not found.')
      if (!readProjectDocument(project.data, projectId)) fail(409, 'Project source is invalid.')
      transaction.update(fireuxProjectsTarget, projectId, {
        ...patch,
        updated: serverAuditStamp({ by: uid }),
      })
    }
  )
  return { ok: true as const, project_id: projectId }
}
