import { randomUUID } from 'node:crypto'
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import type { AppUser } from 'fireux-core/runtime/app/models/app-user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { serverTimestamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  fireuxAppUsersTarget,
  fireuxUserNotificationsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

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
      const [membership, admins] = await Promise.all([
        transaction.read<AppUser>(memberships, uid),
        transaction.query<AppUser>(memberships, {
          field: 'role',
          op: '==',
          value: 'admin',
          limit: 32,
        }),
      ])
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
      if (membership.data?.subscription === 'business') {
        transaction.update(memberships, uid, { primary_project: projectId })
        return {
          ok: true as const,
          primary_project: projectId,
          updated: true as const,
          notified: 0,
        }
      }

      const currentPrimary = projects.includes(
        String(membership.data?.primary_project || '').trim()
      )
        ? String(membership.data?.primary_project || '').trim()
        : projects.length === 1
          ? projects[0]!
          : ''
      if (projectId === currentPrimary) {
        fail(409, 'That Project is already primary.')
      }

      const requestId = `primary-project-${randomUUID()}`
      for (const admin of admins) {
        if (admin.id === uid) continue
        transaction.create(fireuxUserNotificationsTarget(admin.id), requestId, {
          message: `Primary Project change requested by ${uid}: ${currentPrimary || 'none'} → ${projectId}.`,
          scope: 'app',
          created: { at: serverTimestamp(), app_id: appId },
          read: false,
        })
      }
      return {
        ok: true as const,
        requestedProjectId: projectId,
        notified: admins.filter((admin) => admin.id !== uid).length,
      }
    }
  )
}
