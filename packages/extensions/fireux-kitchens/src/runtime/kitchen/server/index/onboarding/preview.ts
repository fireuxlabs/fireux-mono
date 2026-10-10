import type { H3Event } from 'h3'
import type { KitchenOnboardingPreview } from '../../../models/kitchen-onboarding.model.ts'
import {
  assertKitchenOnboardingPlaceDefaults,
  kitchenOnboardingAccessDecision,
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  readKitchenOnboardingActor as actor,
  resolveKitchenOnboardingBeneficiaryUserId,
} from './onboarding-actor'
import { resolveKitchenOnboardingPreviewLocator } from './locator'
import {
  KITCHEN_ACCESS_COLLECTION_PATH,
  readKitchenAccessIds,
} from '../../../utils/kitchen-access'
import { fail, readKitchenOnboardingRequest as request } from './request.ts'

export async function previewKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingPreview> {
  const body = request(input, ['place_id', 'kitchen_id', 'owner_user_id'])
  const current = await actor(event)
  const ownerUserId = resolveKitchenOnboardingBeneficiaryUserId(
    current,
    body.owner_user_id
  )
  const locator = await resolveKitchenOnboardingPreviewLocator(current.db, body)
  const [place, ownerMembership, teamMember, kitchenAccess] = await Promise.all(
    [
      current.db.collection('places').doc(locator.placeId).get(),
      current.db.doc(`apps/${current.appId}/users/${ownerUserId}`).get(),
      current.db.doc(`kitchens/${locator.kitchenId}/team/${ownerUserId}`).get(),
      current.db
        .collection(KITCHEN_ACCESS_COLLECTION_PATH)
        .doc(ownerUserId)
        .get(),
    ]
  )
  const ownerRole = requireOnboardingMemberRole(
    ownerMembership.exists,
    ownerMembership.get('role')
  )
  const actorRole = current.role
  if (!actorRole) fail(500, 'Kitchen onboarding actor role is unavailable.')
  const placeData = place.data() || {}
  if (!locator.kitchen && teamMember.exists) {
    fail(409, 'Kitchen Team membership exists without its Kitchen.')
  }

  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    teamMember: teamMember.exists ? teamMember.data() || {} : null,
    uid: ownerUserId,
    role: ownerUserId === current.uid ? ownerRole : actorRole,
    canCreate: current.canCreate,
    kitchenId: locator.kitchenId,
    membership: ownerMembership.data(),
    kitchenIds: readKitchenAccessIds(
      kitchenAccess.data(),
      ownerMembership.data(),
      current.appId
    ),
  })
  const slug = text(
    (locator.kitchen?.identity as Record<string, unknown> | undefined)?.slug
  )
  if (locator.kitchen) {
    try {
      if (!place.exists) throw new Error('missing')
      assertKitchenOnboardingPlaceDefaults(placeData)
    } catch {
      decision.can_complete = false
      decision.message =
        'This kitchen needs its location details repaired by an administrator before it can be opened here.'
    }
  }
  const displayName = text(placeData.name)
  const published =
    (locator.kitchen?.identity as Record<string, unknown> | undefined)
      ?.visibility === true
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    ...(ownerUserId !== current.uid ? { owner_user_id: ownerUserId } : {}),
    existing: Boolean(locator.kitchen),
    connected: decision.action === 'open',
    ...decision,
    place: {
      id: locator.placeId,
      name: displayName,
      formatted_address: text(placeData.formatted_address),
      short_address: text(placeData.short_address),
      default_currency_code: text(placeData.default_currency_code),
      timezone: text(placeData.timezone),
    },
    ...(displayName ? { display_name: displayName } : {}),
    ...(locator.kitchen ? { published } : {}),
    ...(slug ? { slug } : {}),
  }
}
