// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
// Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: persist only root colours differing from the linked Place.
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverRuntimeUserTargetsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  kitchenRootTarget,
  serverAppKitchensTarget,
} from './firestore-targets'
import {
  parseBrandPalette,
  readBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../models/kitchen-onboarding.model'
import { KITCHEN_CONSOLE_TARGET_LIMIT } from '../../models/kitchen/kitchen-index.model'
import { AppKitchenStorage, KitchenStorage } from '../../models/kitchen.model'
import {
  assertKitchenOnboardingPlaceDefaults,
  assertKitchenOnboardingScope,
  assertKitchenOnboardingSupportCapacity,
  kitchenOnboardingAccessDecision,
  isKitchenOnboardingPlaceOwnedByApp,
  onboardingRecord as record,
  onboardingText as text,
  readKitchenOnboardingScope,
  readKitchenOnboardingSupport,
  requireOnboardingMemberRole as memberRole,
} from './onboarding-policy'
import { resolveKitchenOnboardingActor } from './onboarding-context'

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
  const collection = db.collection(KitchenStorage.collection)
  const exact = await collection.doc(placeId).get()
  const exactData = exact.exists ? exact.data() || {} : null
  if (exactData && text(exactData.place_id) === placeId) {
    return { placeId, kitchenId: exact.id, kitchen: exactData }
  }

  const matches = await collection
    .where('place_id', '==', placeId)
    .limit(2)
    .get()
  if (matches.size > 1) {
    fail(409, 'More than one Kitchen references this Place.')
  }
  if (matches.size === 1) {
    const match = matches.docs[0]!
    fail(
      409,
      `Kitchen ${match.id} must be migrated to the linked Place id ${placeId}.`
    )
  }
  if (exactData) {
    fail(409, 'The deterministic Kitchen id belongs to another Place.')
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
    const snapshot = await db
      .collection(KitchenStorage.collection)
      .doc(kitchenId)
      .get()
    if (!snapshot.exists) fail(404, 'Kitchen not found.')
    const kitchen = snapshot.data() || {}
    const placeId = requireFirestoreDocumentId(
      kitchen.place_id,
      'Kitchen Place id'
    )
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
  const current = await resolveKitchenOnboardingActor(event)
  const locator = await resolveLocator(current.db, body)
  if (locator.kitchen)
    assertKitchenOnboardingScope(locator.kitchen, current.appId)

  const [place, support] = await Promise.all([
    current.db.collection(PlaceStorage.collection).doc(locator.placeId).get(),
    current.db
      .doc(
        `apps/${current.appId}/${AppKitchenStorage.collection}/${locator.kitchenId}`
      )
      .get(),
  ])
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  if (
    !locator.kitchen && current.role !== 'admin' &&
    !isKitchenOnboardingPlaceOwnedByApp(place.data() || {}, current.appId)
  ) {
    fail(403, 'Choose a Place owned by this App.')
  }
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && support.exists) {
    fail(409, 'Kitchen access exists without its canonical root.')
  }

  const supportData = support.exists ? support.data() || {} : null
  const supportAuthority = readKitchenOnboardingSupport(supportData)
  const decision = kitchenOnboardingAccessDecision({
    kitchen: locator.kitchen,
    support: supportAuthority,
    uid: current.uid,
    role: current.role,
    canCreate: current.canCreate,
  })
  const slug = text(locator.kitchen?.slug)
  const identity = record(locator.kitchen?.identity)
  const displayName = text(
    identity.name
  )
  const published = locator.kitchen?.visibility === true
  const paletteOverride = readBrandPalette(locator.kitchen?.brand_palette)
  return {
    kitchen_id: locator.kitchenId,
    place_id: locator.placeId,
    existing: Boolean(locator.kitchen),
    connected: support.exists,
    ...decision,
    ...(displayName ? { display_name: displayName } : {}),
    ...(locator.kitchen ? { published } : {}),
    ...(slug ? { slug } : {}),
    ...(Object.keys(paletteOverride).length
      ? { palette_override: paletteOverride }
      : {}),
  }
}

export async function completeKitchenOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingCompleteResult> {
  const body = request(input, [
    'place_id',
    'kitchen_id',
    'display_name',
    'palette_override',
  ])
  const displayName = text(body.display_name)
  if (displayName.length > 120) fail(400, 'Kitchen name is too long.')
  const requestedPalette = parseBrandPalette(body.palette_override)
  if ('error' in requestedPalette) fail(400, requestedPalette.error)
  const current = await resolveKitchenOnboardingActor(event)
  const locator = await resolveLocator(current.db, body)
  const memberships = serverAppUsersTarget(current.appId)
  const supports = serverAppKitchensTarget(current.appId)
  const userTargets = serverRuntimeUserTargetsTarget(current.uid)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, place, root, support, targets] = await Promise.all([
      mutations.read(memberships, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(kitchenRootTarget, locator.kitchenId),
      mutations.read(supports, locator.kitchenId),
      mutations.read(userTargets, 'targets'),
    ])
    const role = memberRole(membership.exists, membership.data?.role)
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    if (
      !root.exists && role !== 'admin' &&
      !isKitchenOnboardingPlaceOwnedByApp(place.data || {}, current.appId)
    ) {
      fail(403, 'Choose a Place owned by this App.')
    }
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const rootData = root.exists ? root.data || {} : null
    if (!rootData) {
      fail(409, 'Create the canonical Kitchen root before attaching it to an App.')
    }
    if (rootData) {
      if (text(rootData.place_id) !== locator.placeId) {
        fail(409, 'Kitchen and Place no longer match.')
      }
      assertKitchenOnboardingScope(rootData, current.appId)
    } else if (!current.canCreate) {
      fail(403, 'Kitchen creation is disabled for this App.')
    }

    const supportData = support.exists ? support.data || {} : null
    if (!rootData && supportData) {
      fail(409, 'Kitchen access exists without its canonical root.')
    }
    const supportAuthority = readKitchenOnboardingSupport(supportData)
    const decision = kitchenOnboardingAccessDecision({
      kitchen: rootData,
      support: supportAuthority,
      uid: current.uid,
      role,
      canCreate: current.canCreate,
    })
    if (!decision.can_complete || decision.action === 'request_access') {
      fail(403, decision.message || 'Kitchen access is required.')
    }
    if (supportAuthority && role === 'admin') {
      assertKitchenOnboardingSupportCapacity(supportAuthority, current.uid)
    }

    const createdRoot = false
    const createdAppSupport = !support.exists
    const slug = text(rootData?.slug)
    if (Object.keys(requestedPalette.value).length) {
      fail(409, 'Existing Kitchen colours are preserved during onboarding.')
    }

    const scope = readKitchenOnboardingScope(rootData || {})
    if (scope.state === 'root_only') {
      mutations.update(kitchenRootTarget, locator.kitchenId, {
        console: {
          app_id: current.appId,
          app_role: current.appScopeState === 'tenant_app' ? 'tenant' : 'parent',
        },
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else if (
      scope.state !== current.appScopeState || scope.appId !== current.appId
    ) {
      fail(409, 'Kitchen Console attachment does not match this App.')
    }

    if (createdAppSupport) {
      mutations.create(supports, locator.kitchenId, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        console: {},
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else if (role === 'admin') {
      mutations.update(supports, locator.kitchenId, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    const currentKitchenIds = targets.exists
      ? targets.data?.kitchen_ids
      : []
    if (
      !Array.isArray(currentKitchenIds) ||
      currentKitchenIds.some(id => !text(id) || text(id).includes('/'))
    ) {
      fail(409, 'Kitchen target index has an invalid stored shape.')
    }
    const nextKitchenIds = new Set(currentKitchenIds.map(text))
    nextKitchenIds.add(locator.kitchenId)
    if (nextKitchenIds.size > KITCHEN_CONSOLE_TARGET_LIMIT) {
      fail(409, 'Kitchen console targets exceed the supported limit.')
    }
    if (targets.exists) {
      mutations.update(userTargets, 'targets', {
        kitchen_ids: FieldValue.arrayUnion(locator.kitchenId),
      })
    } else {
      mutations.create(userTargets, 'targets', {
        project_ids: [],
        kitchen_ids: [locator.kitchenId],
      })
    }

    mutations.update(memberships, current.uid, {
      console_enabled: true,
      updated: serverAuditStamp({ by: current.uid }),
    })

    return {
      ok: true,
      kitchen_id: locator.kitchenId,
      place_id: locator.placeId,
      action: decision.action,
      created_root: createdRoot,
      created_app_support: createdAppSupport,
      ...(slug ? { slug } : {}),
    }
  })
}
