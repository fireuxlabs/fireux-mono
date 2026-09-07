import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'

export async function readPropertyMutationActor(event: H3Event) {
  const fireux = useFireUXConfig(event)
  const runtimeAppId = requireFirestoreDocumentId(
    fireux.appId,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Property.'
  )
  return {
    runtimeAppId,
    ecosystem: fireux.ecosystem,
    subscriptionCapacity: fireux.subscriptionCapacity,
    uid,
  }
}

export async function requirePropertyMutationAuthority(
  tx: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readPropertyMutationActor>>,
  propertyId: string
) {
  const [root, membership] = await Promise.all([
    tx.read(FIRESTORE_MUTATION_TARGETS.properties, propertyId),
    tx.read(serverAppUsersTarget(actor.runtimeAppId), actor.uid),
  ])
  if (!root.exists)
    throw createError({ statusCode: 404, statusMessage: 'Property not found.' })
  if (
    !membership.exists ||
    !['admin', 'user', 'dev'].includes(String(membership.data?.role))
  ) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Current App membership is required to manage this Property.',
    })
  }
  if (
    !Array.isArray(membership.data?.properties) ||
    !membership.data.properties.includes(propertyId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Property association is required.',
    })
  }
  const subscription = membership.data?.subscription
  if (!isAppUserSubscription(subscription)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Current App membership has an invalid subscription.',
    })
  }
  const management = readFireuxEntityManagement(root.data?.management)
  const managedAppId = management
    ? resolveFireuxEntityManagementAppId(management, actor.ecosystem)
    : ''
  if (management?.mode !== 'root' && managedAppId !== actor.runtimeAppId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Property belongs to another App scope.',
    })
  }
  return { rootData: root.data || {}, subscription }
}
