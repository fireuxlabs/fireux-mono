import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { useRuntimeConfig } from '#imports'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { createError, type H3Event } from 'h3'
import { getFirestoreDb } from '../../utils/firebase-admin'
import { serverProjectAccessTarget } from 'fireux-core/runtime/project/server/access'

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
  const [app, membership, access, project] = await Promise.all([
    appRef.get(),
    appRef.collection('users').doc(uid).get(),
    db
      .collection(serverProjectAccessTarget(appId).collectionPath)
      .doc(uid)
      .get(),
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
  const projectIds = readMembershipAccessIds(access.data(), membership.data())
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
