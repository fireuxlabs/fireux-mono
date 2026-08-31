import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

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

export async function requireKitchenMutationAuthority(
  mutations: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string,
  _options: { allowRoot?: boolean } = {}
) {
  const runtimeMemberships = serverAppUsersTarget(actor.runtimeAppId)
  const team = serverKitchenTeamMembersTarget(kitchenId)
  const [root, runtimeMembership, teamMember] = await Promise.all([
    mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
    mutations.read(runtimeMemberships, actor.uid),
    mutations.read(team, actor.uid),
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
  const teamRole = String(teamMember.data?.role ?? '').trim()
  if (
    !teamMember.exists ||
    teamMember.data?.user_id !== actor.uid ||
    teamMember.data?.status !== 'active' ||
    (teamRole !== 'owner' && teamRole !== 'operator')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen owner or operator access is required.',
    })
  }

  const rootData = root.data || {}

  const place = await mutations.read(
    FIRESTORE_MUTATION_TARGETS.places,
    kitchenId
  )
  if (!place.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The linked Place does not exist.',
    })
  }
  return {
    ownerRole: String(runtimeMembership.data?.role) as 'admin' | 'user',
    ownerAppId: actor.runtimeAppId,
    placeData: place.data || {},
    rootData,
    subscription,
    teamRole: teamRole as 'owner' | 'operator',
  }
}
