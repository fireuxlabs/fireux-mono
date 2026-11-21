import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership/membership-access'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/membership/access'
import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import { FIREUX_MUTATION_TARGETS, fireuxAppUsersTarget } from './app-targets'
import { fireuxProjectsTarget } from './targets'
import { serverProjectAccessTarget } from './access'

export async function requireProjectOperator(
  event: H3Event,
  projectIdInput: unknown,
  sources?: LiveProjectionSources
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
  const membershipRef = appRef.collection('users').doc(uid)
  const accessRef = db
    .collection(serverProjectAccessTarget(appId).collectionPath)
    .doc(uid)
  for (const ref of [appRef, membershipRef, accessRef, projectRef])
    sources?.watch(ref, { authority: true })
  const [app, membership, access, project] = await Promise.all([
    appRef.get(),
    membershipRef.get(),
    accessRef.get(),
    projectRef.get(),
  ])

  if (!app.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  }
  if (
    !membership.exists ||
    !resolveAppUserAccess(membership.data()).hasMembership
  )
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
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
    transaction.read(FIREUX_MUTATION_TARGETS.fireuxApps, actor.appId),
    transaction.read(fireuxAppUsersTarget(actor.appId), actor.uid),
    transaction.read(serverProjectAccessTarget(actor.appId), actor.uid),
    transaction.read(fireuxProjectsTarget, actor.projectId),
  ])
  if (!app.exists)
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  if (
    !membership.exists ||
    !resolveAppUserAccess(membership.data).hasMembership
  )
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
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
