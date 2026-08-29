import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { fireuxAppUsersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export async function setPrimaryProject(event: H3Event, input: unknown) {
  const { uid } = await requireFirebaseBearerUser(event)
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  const projectId = requireFirestoreDocumentId(source.projectId, 'Project id')
  const appId = requireFirestoreDocumentId(
    useRuntimeConfig().public?.fireux?.id,
    'FireUX App id'
  )
  const memberships = fireuxAppUsersTarget(appId)

  return runGuardedServerTransaction(
    { kind: 'named', databaseId: 'fireux' },
    async (transaction) => {
      const membership = await transaction.read(memberships, uid)
      requireWorkspaceEntityMemberRole({
        exists: membership.exists,
        role: membership.data?.role,
        entityLabel: 'Project',
      })
      const projects = Array.isArray(membership.data?.projects)
        ? membership.data.projects.map(String)
        : []
      if (!projects.includes(projectId)) {
        fail(403, 'The requested Project is not available to this user.')
      }
      transaction.update(memberships, uid, { primary_project: projectId })
      return { ok: true as const, primary_project: projectId }
    }
  )
}
