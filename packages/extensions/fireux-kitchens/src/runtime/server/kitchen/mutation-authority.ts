import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  kitchenRootTarget,
  serverAppKitchensTarget,
} from './firestore-targets'
import {
  readKitchenOnboardingScope,
  readKitchenOnboardingSupport,
} from './onboarding-policy.ts'
import { resolveKitchenConsoleTargetIds } from './console-targets.ts'

export async function readKitchenMutationActor(event: H3Event) {
  const runtimeAppId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'Runtime App id'
  )
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Kitchen.'
  )
  return { runtimeAppId, uid }
}

function requireMemberRole(exists: boolean, value: unknown, message: string) {
  const role = String(value ?? '').trim()
  if (!exists || (role !== 'admin' && role !== 'user')) {
    throw createError({ statusCode: 403, statusMessage: message })
  }
  return role as 'admin' | 'user'
}

export async function requireKitchenMutationAuthority(
  mutations: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string
) {
  const runtimeMemberships = serverAppUsersTarget(actor.runtimeAppId)
  const [root, runtimeMembership] = await Promise.all([
    mutations.read(kitchenRootTarget, kitchenId),
    mutations.read(runtimeMemberships, actor.uid),
  ])
  if (!root.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  requireMemberRole(
    runtimeMembership.exists,
    runtimeMembership.data?.role,
    'Current App membership is required to manage this Kitchen.'
  )
  const targetIds = await resolveKitchenConsoleTargetIds(
    actor.uid,
    runtimeMembership.data || {}
  )
  if (!targetIds.includes(kitchenId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This Kitchen is not an available Console target.',
    })
  }

  const rootData = root.data || {}
  const scope = readKitchenOnboardingScope(rootData)
  if (scope.state !== 'parent_app' && scope.state !== 'tenant_app') {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen is not attached to an App.',
    })
  }
  const ownerAppId = requireFirestoreDocumentId(
    scope.appId,
    'Kitchen owner App id'
  )
  const ownerMemberships = serverAppUsersTarget(ownerAppId)
  const supports = serverAppKitchensTarget(ownerAppId)
  const [ownerMembership, support] = await Promise.all([
    ownerAppId === actor.runtimeAppId
      ? Promise.resolve(runtimeMembership)
      : mutations.read(ownerMemberships, actor.uid),
    mutations.read(supports, kitchenId),
  ])
  const ownerRole = requireMemberRole(
    ownerMembership.exists,
    ownerMembership.data?.role,
    'Kitchen owner App membership is required.'
  )
  const authority = support.exists
    ? readKitchenOnboardingSupport(support.data || {})
    : null
  if (
    !authority ||
    (ownerRole !== 'admin' && !authority.operatorIds.includes(actor.uid))
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'App admin or Kitchen operator access is required.',
    })
  }

  const placeId = requireFirestoreDocumentId(
    rootData.place_id,
    'Kitchen Place id'
  )
  const place = await mutations.read(FIRESTORE_MUTATION_TARGETS.places, placeId)
  if (!place.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The linked Place does not exist.',
    })
  }
  return {
    authority,
    ownerAppId,
    placeData: place.data || {},
    rootData,
    supportData: support.data || {},
    supports,
  }
}
