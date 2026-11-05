import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { serverBusinessAccessTarget } from '../mutation-targets'
import { BUSINESS_MUTATION_TARGETS } from '../mutation-targets'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/app/utils/entity-management'

export async function readBusinessMutationActor(event: H3Event) {
  const fireux = useFireUXConfig(event)
  const runtimeAppId = requireFirestoreDocumentId(
    fireux.appId,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Business.'
  )
  return {
    runtimeAppId,
    ecosystem: fireux.ecosystem,
    subscriptionCapacity: fireux.subscriptionCapacity,
    uid,
  }
}

export async function requireBusinessMutationAuthority(
  tx: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readBusinessMutationActor>>,
  businessId: string
) {
  const [root, membership, access] = await Promise.all([
    tx.read(BUSINESS_MUTATION_TARGETS.businesses, businessId),
    tx.read(serverAppUsersTarget(actor.runtimeAppId), actor.uid),
    tx.read(serverBusinessAccessTarget(actor.runtimeAppId), actor.uid),
  ])
  if (!root.exists)
    throw createError({ statusCode: 404, statusMessage: 'Business not found.' })
  if (
    !membership.exists ||
    !['admin', 'user', 'dev'].includes(String(membership.data?.role))
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required to manage this Business.',
    })
  }
  if (
    !readMembershipAccessIds(access.data, membership.data).includes(businessId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Business association is required.',
    })
  }
  const subscription = readAppUserSubscription(membership.data?.subscription)
  if (!subscription) {
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
      statusMessage: 'Business belongs to another App scope.',
    })
  }
  return { rootData: root.data || {}, subscription }
}
