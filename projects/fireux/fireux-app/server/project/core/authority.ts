import { useRuntimeConfig } from '#imports'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { createError, type H3Event } from 'h3'
import { getFirestoreDb } from '../../utils/firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()

export async function requireProjectOperator(
  event: H3Event,
  projectIdInput: unknown
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const projectId = requireFirestoreDocumentId(projectIdInput, 'Project id')
  const appId = requireFirestoreDocumentId(
    useRuntimeConfig().public?.fireux?.id,
    'FireUX App id'
  )
  const db = await getFirestoreDb('fireux')
  const appRef = db.collection('apps').doc(appId)
  const projectRef = db.collection('projects').doc(projectId)
  const teamRef = projectRef.collection('team')
  const [app, membership, project] = await Promise.all([
    appRef.get(),
    appRef.collection('users').doc(uid).get(),
    projectRef.get(),
  ])

  if (!app.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  }
  requireWorkspaceEntityMemberRole({
    exists: membership.exists,
    role: membership.data()?.role,
    entityLabel: 'Project',
  })
  const projectIds = Array.isArray(membership.data()?.projects)
    ? membership.data()!.projects.map(text).filter(Boolean)
    : []
  if (!projectIds.includes(projectId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Project membership is required.',
    })
  }
  if (!project.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project was not found.',
    })
  }


  return {
    uid,
    projectId,
    db,
    projectRef,
    teamRef,
    membership: membership.data() || {},
  }
}
