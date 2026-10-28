import { serverKitchenAccessTarget } from './access'
import { readKitchenAccessIds } from '../../utils/kitchen-access'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { KITCHEN_MUTATION_TARGETS } from '../mutation-targets'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
export async function readKitchenMutationActor(event: H3Event) {
  const fireux = useFireUXConfig(event)
  const runtimeAppId = requireFirestoreDocumentId(
    fireux.appId,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Kitchen.'
  )
  return {
    runtimeAppId,
    ecosystem: fireux.ecosystem,
    subscriptionCapacity: fireux.subscriptionCapacity,
    uid,
  }
}

function requireMemberRole(exists: boolean, value: unknown, message: string) {
  const role = String(value ?? '').trim()
  if (!exists || (role !== 'admin' && role !== 'user' && role !== 'dev')) {
    throw createError({ statusCode: 403, statusMessage: message })
  }
  return role as 'admin' | 'user'
}

export async function requireKitchenRecordMutationAuthority(
  mutations: Pick<GuardedServerTransaction, 'read'>,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string
) {
  const runtimeMemberships = serverAppUsersTarget(actor.runtimeAppId)
  const [root, runtimeMembership, access] = await Promise.all([
    mutations.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
    mutations.read(runtimeMemberships, actor.uid),
    mutations.read(serverKitchenAccessTarget(), actor.uid),
  ])
  if (!root.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  requireMemberRole(
    runtimeMembership.exists,
    runtimeMembership.data?.role,
    'Current App membership is required to manage this Kitchen.'
  )
  const subscription = runtimeMembership.data?.subscription
  if (!isAppUserSubscription(subscription)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Current App membership has an invalid subscription.',
    })
  }
  if (
    !readKitchenAccessIds(
      access.data,
      runtimeMembership.data,
      actor.runtimeAppId
    ).includes(kitchenId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen association is required.',
    })
  }

  return {
    ownerRole: String(runtimeMembership.data?.role) as 'admin' | 'user',
    ownerAppId: actor.runtimeAppId,
    rootData: root.data || {},
    subscription,
  }
}

/** Preserve the Place prerequisite for existing Place-dependent workflows. */
export async function requireKitchenMutationAuthority(
  mutations: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string,
  _options: { allowRoot?: boolean } = {}
) {
  const authority = await requireKitchenRecordMutationAuthority(
    mutations,
    actor,
    kitchenId
  )
  const place = await mutations.read(
    PLACE_MUTATION_TARGETS.places,
    kitchenId
  )
  if (!place.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The linked Place does not exist.',
    })
  }
  return { ...authority, placeData: place.data || {} }
}
