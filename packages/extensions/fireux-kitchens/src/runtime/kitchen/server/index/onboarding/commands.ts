// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
import { createError, type H3Event } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../models/kitchen-onboarding.model.ts'
import {
  assertKitchenOnboardingPlaceDefaults,
  kitchenOnboardingAccessDecision,
  onboardingText as text,
  requireOnboardingMemberRole,
} from './onboarding-policy'
import {
  readKitchenOnboardingActor as actor,
  type KitchenOnboardingFirestore as Firestore,
} from './onboarding-actor'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'

type Locator = {
  placeId: string
  kitchenId: string
  kitchen: Record<string, unknown> | null
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown, allowed: readonly string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Kitchen onboarding request must be an object.')
  }
  const source = value as Record<string, unknown>
  const supported = new Set(allowed)
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `Kitchen onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

async function kitchenForPlace(
  db: Firestore,
  placeId: string
): Promise<Locator> {
  const collection = db.collection('kitchens')
  const exact = await collection.doc(placeId).get()
  const exactData = exact.exists ? exact.data() || {} : null
  if (exactData) {
    return { placeId, kitchenId: exact.id, kitchen: exactData }
  }
  return { placeId, kitchenId: placeId, kitchen: null }
}

async function resolveLocator(
  db: Firestore,
  value: Record<string, unknown>
): Promise<Locator> {
  const requestedKitchenId = text(value.kitchen_id)
  if (requestedKitchenId) {
    const kitchenId = requireFirestoreDocumentId(
      requestedKitchenId,
      'Kitchen id'
    )
    const snapshot = await db.collection('kitchens').doc(kitchenId).get()
    if (!snapshot.exists) fail(404, 'Kitchen not found.')
    const kitchen = snapshot.data() || {}
    const placeId = kitchenId
    const requestedPlaceId = text(value.place_id)
    if (requestedPlaceId && requestedPlaceId !== placeId) {
      fail(409, 'Kitchen and Place do not match.')
    }
    return { placeId, kitchenId, kitchen }
  }

  const placeId = requireFirestoreDocumentId(value.place_id, 'Place id')
  return kitchenForPlace(db, placeId)
}

export async function previewKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingPreview> {
  const body = request(input, ['place_id', 'kitchen_id'])
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  const [place, teamMember] = await Promise.all([
    current.db.collection('places').doc(locator.placeId).get(),
    current.db.doc(`kitchens/${locator.kitchenId}/team/${current.uid}`).get(),
  ])
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && teamMember.exists) {
    fail(409, 'Kitchen Team membership exists without its Kitchen.')
  }

  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    teamMember: teamMember.exists ? teamMember.data() || {} : null,
    uid: current.uid,
    role: current.role,
    canCreate: current.canCreate,
  })
  const slug = text(locator.kitchen?.slug)
  const displayName = text(place.data()?.name)
  const published = locator.kitchen?.visibility === true
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    existing: Boolean(locator.kitchen),
    connected: teamMember.exists,
    ...decision,
    ...(displayName ? { display_name: displayName } : {}),
    ...(locator.kitchen ? { published } : {}),
    ...(slug ? { slug } : {}),
  }
}

export async function completeKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingCompleteResult> {
  const body = request(input, ['place_id', 'kitchen_id'])
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  const memberships = serverAppUsersTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(locator.kitchenId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, place, root, teamMember] = await Promise.all([
      mutations.read(memberships, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(teamMembers, current.uid),
    ])
    const role = requireOnboardingMemberRole(
      membership.exists,
      membership.data?.role
    )
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const rootData = root.exists ? root.data || {} : null
    if (!rootData && !current.canCreate) {
      fail(403, 'Kitchen creation is disabled for this App.')
    }

    if (!rootData && teamMember.exists) {
      fail(409, 'Kitchen Team membership exists without its Kitchen.')
    }
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      teamMember: teamMember.exists ? teamMember.data || {} : null,
      uid: current.uid,
      role,
      canCreate: current.canCreate,
    })
    if (!decision.can_complete || decision.action === 'request_access') {
      fail(403, decision.message || 'Kitchen access is required.')
    }

    const createdRoot = !root.exists
    const createdTeamMember = !teamMember.exists
    const placeName = text(place.data?.name)
    const slug =
      text(rootData?.slug) || normalizeSlug(placeName || locator.kitchenId)
    const creatorName = text(user.data?.display_name) || current.authDisplayName
    if (createdRoot && !creatorName) {
      fail(409, 'Finish your User name before creating a Kitchen.')
    }

    if (createdRoot) {
      const stamp = serverAuditStamp({ by: current.uid, appId: current.appId })
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId, {
        name: placeName,
        slug,
        status: 'active',
        visibility: false,
        created: stamp,
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    if (createdTeamMember) {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId: locator.kitchenId,
          memberId: current.uid,
          name: creatorName,
          role: createdRoot ? 'owner' : 'operator',
          slug: normalizeSlug(creatorName) || 'team-member',
          userId: current.uid,
        })
      )
    }

    mutations.update(memberships, current.uid, {
      workspace_enabled: true,
      updated: serverAuditStamp({ by: current.uid }),
    })

    return {
      ok: true,
      kitchen_id: locator.kitchenId,
      place_id: locator.placeId,
      action: decision.action,
      created_root: createdRoot,
      created_team_member: createdTeamMember,
      ...(slug ? { slug } : {}),
    }
  })
}

export async function createKitchenShell(event: H3Event, input: unknown) {
  const body = request(input, ['name'])
  const name = text(body.name)
  if (!name || name.length > 120) {
    fail(400, 'Kitchen name is required and must be 120 characters or fewer.')
  }

  const current = await actor(event, {
    allowAnonymous: true,
    allowMissingMembership: true,
  })
  if (!current.canCreate)
    fail(403, 'Kitchen creation is disabled for this App.')

  const kitchenId = current.db.collection('kitchens').doc().id
  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  const creatorName =
    current.authDisplayName || `Guest ${current.uid.slice(0, 6)}`

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [root, teamMember] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, current.uid),
    ])
    if (root.exists || teamMember.exists) {
      fail(409, 'Kitchen shell identity already exists.')
    }

    const slug = normalizeSlug(name) || kitchenId.toLowerCase()
    mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      name,
      slug,
      status: 'active',
      visibility: false,
      created: serverAuditStamp({ by: current.uid, appId: current.appId }),
      updated: serverAuditStamp({ by: current.uid }),
    })
    mutations.create(
      teamMembers,
      current.uid,
      buildKitchenTeamMemberRecord({
        appId: current.appId,
        createdBy: current.uid,
        kitchenId,
        memberId: current.uid,
        name: creatorName,
        role: 'owner',
        slug: normalizeSlug(creatorName) || 'guest',
        userId: current.uid,
      })
    )

    return {
      ok: true as const,
      kitchen_id: kitchenId,
      action: 'create' as const,
      created_root: true,
      created_team_member: true,
      slug,
    }
  })
}

export async function adoptAnonymousKitchen(event: H3Event, input: unknown) {
  const body = request(input, ['kitchen_id', 'anonymous_token'])
  const kitchenId = requireFirestoreDocumentId(body.kitchen_id, 'Kitchen id')
  const anonymousToken = text(body.anonymous_token)
  if (!anonymousToken) fail(400, 'Anonymous identity proof is required.')

  const current = await actor(event, { allowMissingMembership: true })
  const decoded = await getAuth(getAdminApp())
    .verifyIdToken(anonymousToken, true)
    .catch(() => null)
  if (!decoded?.uid || decoded.firebase?.sign_in_provider !== 'anonymous') {
    fail(401, 'Anonymous identity proof is invalid.')
  }
  const anonymousUid = requireFirestoreDocumentId(
    decoded.uid,
    'Anonymous user id'
  )
  if (anonymousUid === current.uid) {
    return { ok: true as const, kitchen_id: kitchenId, adopted: false }
  }

  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [root, anonymousMember, currentMember, user] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, anonymousUid),
      mutations.read(teamMembers, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, current.uid),
    ])
    const rootCreated = root.data?.created as
      | Record<string, unknown>
      | undefined
    if (!root.exists || text(rootCreated?.by) !== anonymousUid) {
      fail(403, 'This anonymous identity did not create the Kitchen.')
    }
    if (
      !anonymousMember.exists ||
      text(anonymousMember.data?.user_id) !== anonymousUid ||
      anonymousMember.data?.status !== 'active' ||
      anonymousMember.data?.role !== 'owner'
    ) {
      fail(409, 'Anonymous Kitchen ownership is incomplete.')
    }

    const name =
      text(user.data?.display_name) ||
      current.authDisplayName ||
      `User ${current.uid.slice(0, 6)}`
    if (currentMember.exists) {
      mutations.update(teamMembers, current.uid, {
        user_id: current.uid,
        role: 'owner',
        status: 'active',
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId,
          memberId: current.uid,
          name,
          role: 'owner',
          slug: normalizeSlug(name) || 'owner',
          userId: current.uid,
        })
      )
    }
    mutations.delete(teamMembers, anonymousUid)
    return { ok: true as const, kitchen_id: kitchenId, adopted: true }
  })
}
