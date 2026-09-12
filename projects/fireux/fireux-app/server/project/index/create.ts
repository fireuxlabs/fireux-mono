import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppUsersTarget,
  fireuxProjectTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getFirestoreDb } from '../../utils/firebase-admin'
import {
  membershipCreatedAt,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/utils/membership-access'
import { serverProjectAccessTarget } from 'fireux-core/runtime/project/server/access'

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
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'FireUX App id')
  const db = await getFirestoreDb('fireux')
  const account = await db.collection('users').doc(uid).get()
  const memberName = String(
    account.data()?.display_name || account.data()?.handle || 'Team member'
  )
  const generatedProjectId = db.collection('projects').doc().id
  const memberships = fireuxAppUsersTarget(appId)
  const accessTarget = serverProjectAccessTarget(appId)

  return runGuardedServerTransaction(
    { kind: 'named', databaseId: 'fireux' },
    async (transaction) => {
      const [app, membership, access] = await Promise.all([
        transaction.read(FIRESTORE_MUTATION_TARGETS.fireuxApps, appId),
        transaction.read(memberships, uid),
        transaction.read(accessTarget, uid),
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

      const projects = readMembershipAccessIds(access.data, membership.data)
      if (
        !hasAppSubscriptionCapacity(
          fireux.subscriptionCapacity,
          'project',
          subscription,
          projects.length
        )
      ) {
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
        name: memberName,
        role_ids: [],
      })
      const nextAccess = {
        ids: [...projects, projectId],
        membership_created_at: membershipCreatedAt(membership.data),
      }
      if (access.exists) transaction.update(accessTarget, uid, nextAccess)
      else transaction.create(accessTarget, uid, nextAccess)

      return {
        ok: true as const,
        project_id: projectId,
        action: 'create' as const,
      }
    }
  )
}
