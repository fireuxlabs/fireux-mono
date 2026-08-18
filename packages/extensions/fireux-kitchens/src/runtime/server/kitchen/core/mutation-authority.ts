import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveFireuxEntityManagementAppId } from 'fireux-core/runtime/utils/entity-management'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppKitchensTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenOnboardingManagement,
  readKitchenOnboardingSupport,
} from '../index/onboarding/onboarding-policy.ts'
import { resolveKitchenConsoleTargetIds } from './console-targets.ts'

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
  return { runtimeAppId, ecosystem: fireux.ecosystem, uid }
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
  kitchenId: string,
  options: { allowRoot?: boolean } = {}
) {
  const runtimeMemberships = serverAppUsersTarget(actor.runtimeAppId)
  const [root, runtimeMembership] = await Promise.all([
    mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
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
  const management = readKitchenOnboardingManagement(rootData)
  if (management.mode === 'root') {
    if (options.allowRoot === true) {
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
        authority: null,
        ownerRole: String(runtimeMembership.data?.role) as 'admin' | 'user',
        ownerAppId: actor.runtimeAppId,
        placeData: place.data || {},
        rootData,
        supportData: {},
        supports: serverAppKitchensTarget(actor.runtimeAppId),
      }
    }
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen is not attached to an App.',
    })
  }
  const ownerAppId = requireFirestoreDocumentId(
    resolveFireuxEntityManagementAppId(management, actor.ecosystem),
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
    authority,
    ownerRole,
    ownerAppId,
    placeData: place.data || {},
    rootData,
    supportData: support.data || {},
    supports,
  }
}
