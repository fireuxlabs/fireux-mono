import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppUsersTarget,
  fireuxProjectTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getFirestoreDb } from '../../utils/firebase-admin'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Project creation request must be an object.')
  }
  const source = value as Record<string, unknown>
  const unsupported = Object.keys(source).find((key) => key !== 'name')
  if (unsupported) {
    fail(400, `Project creation contains unsupported field: ${unsupported}.`)
  }
  const name = String(source.name ?? '').trim()
  if (!name || name.length > 120) {
    fail(400, 'Project name is required and must be 120 characters or fewer.')
  }
  return { name }
}

export async function createProject(event: H3Event, input: unknown) {
  const { uid } = await requireFirebaseBearerUser(event)
  const { name } = request(input)
  const appId = requireFirestoreDocumentId(
    useRuntimeConfig().public?.fireux?.id,
    'FireUX App id'
  )
  const db = await getFirestoreDb('fireux')
  const generatedProjectId = db.collection('projects').doc().id
  const memberships = fireuxAppUsersTarget(appId)

  return runGuardedServerTransaction(
    { kind: 'named', databaseId: 'fireux' },
    async (transaction) => {
      const [app, membership] = await Promise.all([
        transaction.read(FIRESTORE_MUTATION_TARGETS.fireuxApps, appId),
        transaction.read(memberships, uid),
      ])
      const subscription = membership.data?.subscription
      if (!app.exists) {
        fail(403, 'FireUX App membership is required to create a Project.')
      }
      requireWorkspaceEntityMemberRole({
        exists: membership.exists,
        role: membership.data?.role,
        entityLabel: 'Project',
      })
      if (!isAppUserSubscription(subscription)) {
        fail(409, 'The FireUX App subscription has an invalid stored shape.')
      }

      const projects = [
        ...new Set(
          (Array.isArray(membership.data?.projects)
            ? membership.data.projects
            : []
          )
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        ),
      ]
      if (subscription !== 'business' && projects.length) {
        fail(403, 'Your current subscription supports one Project.')
      }

      const projectId = requireFirestoreDocumentId(
        projects.length === 0
          ? resolveWorkspaceEntityCreationId({
              intent: 'create_shell',
              ownerUserId: uid,
            })
          : generatedProjectId,
        'Project id'
      )
      const teamMembers = fireuxProjectTeamMembersTarget(projectId)

      const created = serverAuditStamp({ by: uid, appId })
      transaction.create(FIRESTORE_MUTATION_TARGETS.fireuxProjects, projectId, {
        status: 'inactive',
        name,
        description: '',
        image_url: '',
        created,
        updated: serverAuditStamp({ by: uid }),
      })
      transaction.create(teamMembers, uid, {
        user_id: uid,
        role: 'owner',
        permissions: [],
        status: 'active',
      })
      transaction.update(memberships, uid, {
        projects: [...projects, projectId],
        primary_project: projectId,
      })

      return {
        ok: true as const,
        project_id: projectId,
        action: 'create' as const,
      }
    }
  )
}
