import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/workspace/server/entity/onboarding-authority'
import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  fireuxAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { fireuxProjectsTarget } from './targets'
import { serverProjectAccessTarget } from './access'

export async function requireProjectOperator(
  event: H3Event,
  projectIdInput: unknown
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const projectId = requireFirestoreDocumentId(projectIdInput, 'Project id')
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'FireUX App id'
  )
  const db = getRuntimeFirestore('fireux')
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
    appId,
    projectId,
    db,
    projectRef,
    teamRef,
    membership: membership.data() || {},
  }
}

/** Recheck the current membership-bound Project authority in the writing snapshot. */
export async function requireProjectOperatorInTransaction(
  transaction: GuardedServerTransaction,
  actor: { uid: string; appId: string; projectId: string }
) {
  const [app, membership, access, project] = await Promise.all([
    transaction.read(FIRESTORE_MUTATION_TARGETS.fireuxApps, actor.appId),
    transaction.read(fireuxAppUsersTarget(actor.appId), actor.uid),
    transaction.read(serverProjectAccessTarget(actor.appId), actor.uid),
    transaction.read(fireuxProjectsTarget, actor.projectId),
  ])
  if (!app.exists)
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  requireWorkspaceEntityMemberRole({
    exists: membership.exists,
    role: membership.data?.role,
    entityLabel: 'Project',
  })
  if (
    !readMembershipAccessIds(access.data, membership.data).includes(
      actor.projectId
    )
  )
    throw createError({
      statusCode: 403,
      statusMessage: 'Project membership is required.',
    })
  if (!project.exists)
    throw createError({
      statusCode: 404,
      statusMessage: 'Project was not found.',
    })
  return membership.data || {}
}
