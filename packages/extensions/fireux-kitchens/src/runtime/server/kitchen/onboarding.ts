// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, App access, and UserApp target.
// Concurrent edit — 2026-07-21 22:05 CEST — Kitchen onboarding repair: normalize only absent support authority arrays inside the trusted transaction.
// Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: persist only root colours differing from the linked Place.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import {
  resolveFireuxAppScopeStateForRole,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  compactBrandPalette,
  parseBrandPalette,
  readBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../models/kitchen-onboarding.model'
import { KitchenStorage } from '../../models/kitchen.model'
import {
  assertKitchenOnboardingMembershipCapacity,
  assertKitchenOnboardingPlaceDefaults,
  assertKitchenOnboardingScope,
  assertKitchenOnboardingSupportCapacity,
  kitchenOnboardingAccessDecision,
  onboardingRecord as record,
  onboardingText as text,
  readKitchenOnboardingScope,
  readKitchenOnboardingSupportForTrustedRepair,
  requireOnboardingMemberRole as memberRole,
  type KitchenOnboardingMemberRole as MemberRole,
} from './onboarding-policy'

type Firestore = ReturnType<typeof getRuntimeFirestore>

type RuntimePolicy = {
  appId: string
  appRole: string
  appScopeState: 'parent_app' | 'tenant_app'
  canCreate: boolean
  targetIds: string[]
}

type Actor = RuntimePolicy & {
  uid: string
  db: Firestore
  membershipRef: ReturnType<Firestore['doc']>
}

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
  const unsupported = Object.keys(source).find(key => !supported.has(key))
  if (unsupported) {
    fail(400, `Kitchen onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = record(useRuntimeConfig(event).public?.fireux)
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const appRole = text(fireux.role)
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) fail(403, 'This App cannot own a Kitchen console.')

  const kitchenConfig = record(record(fireux.consoleConfig).kitchen)
  const canCreate = typeof kitchenConfig.canCreate === 'boolean'
    ? kitchenConfig.canCreate
    : appRole !== 'tenant'
  const targetIds = Array.isArray(kitchenConfig.targetIds)
    ? Array.from(new Set(kitchenConfig.targetIds.map(text).filter(Boolean)))
    : []

  return { appId, appRole, appScopeState, canCreate, targetIds }
}

function assertRuntimeTarget(current: RuntimePolicy, kitchenId: string) {
  if (current.appRole !== 'tenant') return
  if (!current.targetIds.includes(kitchenId)) {
    fail(403, 'This Kitchen is not a configured target for the tenant App.')
  }
}

async function actor(event: H3Event): Promise<Actor & { role: MemberRole }> {
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${policy.appId}/${UserAppStorage.collection}/${uid}`
  )
  const membership = await membershipRef.get()
  const role = memberRole(membership.exists, membership.get('role'))
  return { ...policy, uid, db, membershipRef, role }
}

async function kitchenForPlace(db: Firestore, placeId: string): Promise<Locator> {
  const collection = db.collection(KitchenStorage.rootCollection)
  const exact = await collection.doc(placeId).get()
  const exactData = exact.exists ? exact.data() || {} : null
  if (exactData && text(exactData.place_id) === placeId) {
    return { placeId, kitchenId: exact.id, kitchen: exactData }
  }

  const matches = await collection.where('place_id', '==', placeId).limit(2).get()
  if (matches.size > 1) {
    fail(409, 'More than one Kitchen references this Place.')
  }
  if (matches.size === 1) {
    const match = matches.docs[0]
    return { placeId, kitchenId: match.id, kitchen: match.data() || {} }
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
    const kitchenId = requireFirestoreDocumentId(requestedKitchenId, 'Kitchen id')
    const snapshot = await db
      .collection(KitchenStorage.rootCollection)
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
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  assertRuntimeTarget(current, locator.kitchenId)
  if (locator.kitchen) assertKitchenOnboardingScope(locator.kitchen, current.appId)

  const [place, support] = await Promise.all([
    current.db.collection(PlaceStorage.collection).doc(locator.placeId).get(),
    current.db.doc(
      `apps/${current.appId}/${KitchenStorage.scopeCollection}/${locator.kitchenId}`
    ).get(),
  ])
  if (!place.exists) fail(409, 'The linked Place does not exist.')
  assertKitchenOnboardingPlaceDefaults(place.data() || {})
  if (!locator.kitchen && support.exists) {
    fail(409, 'Kitchen access exists without its canonical root.')
  }

  const supportData = support.exists ? support.data() || {} : null
  const supportCandidate = readKitchenOnboardingSupportForTrustedRepair(supportData)
  if (supportCandidate.missingFields.length > 0 && current.role !== 'admin') {
    fail(409, 'An App admin must repair this Kitchen access record.')
  }
  const supportAuthority = supportCandidate.support
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
    identity.display_name ||
    locator.kitchen?.display_name ||
    locator.kitchen?.name
  )
  const visibility = record(locator.kitchen?.visibility)
  const published = visibility.show === true || locator.kitchen?.show === true
  const paletteOverride = readBrandPalette(
    record(locator.kitchen?.menus).style
  )
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
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  assertRuntimeTarget(current, locator.kitchenId)
  const rootRef = current.db
    .collection(KitchenStorage.rootCollection)
    .doc(locator.kitchenId)
  const placeRef = current.db
    .collection(PlaceStorage.collection)
    .doc(locator.placeId)
  const supportRef = current.db.doc(
    `apps/${current.appId}/${KitchenStorage.scopeCollection}/${locator.kitchenId}`
  )

  return current.db.runTransaction(async transaction => {
    const [membership, place, root, support] = await Promise.all([
      transaction.get(current.membershipRef),
      transaction.get(placeRef),
      transaction.get(rootRef),
      transaction.get(supportRef),
    ])
    const role = memberRole(membership.exists, membership.get('role'))
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    assertKitchenOnboardingPlaceDefaults(place.data() || {})
    assertKitchenOnboardingMembershipCapacity(
      membership.data() || {},
      locator.kitchenId
    )

    const rootData = root.exists ? root.data() || {} : null
    if (rootData) {
      if (text(rootData.place_id) !== locator.placeId) {
        fail(409, 'Kitchen and Place no longer match.')
      }
      assertKitchenOnboardingScope(rootData, current.appId)
    } else if (!current.canCreate) {
      fail(403, 'Kitchen creation is disabled for this App.')
    }

    const supportData = support.exists ? support.data() || {} : null
    if (!rootData && supportData) {
      fail(409, 'Kitchen access exists without its canonical root.')
    }
    const supportCandidate = readKitchenOnboardingSupportForTrustedRepair(supportData)
    if (supportCandidate.missingFields.length > 0 && role !== 'admin') {
      fail(409, 'An App admin must repair this Kitchen access record.')
    }
    const supportAuthority = supportCandidate.support
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

    const createdRoot = !root.exists
    const createdAppSupport = !support.exists
    const placeName = text(place.get('name'))
    const slug = text(rootData?.slug)
    const placePalette = readBrandPalette(place.get('brand_palette'))
    const paletteOverride = compactBrandPalette(
      requestedPalette.value,
      placePalette
    )

    if (!createdRoot && Object.keys(requestedPalette.value).length) {
      fail(409, 'Existing Kitchen colours are preserved during onboarding.')
    }

    if (createdRoot) {
      transaction.create(rootRef, {
        place_id: locator.placeId,
        app_scope: {
          state: current.appScopeState,
          app_id: current.appId,
        },
        visibility: {
          show: false,
          active: true,
          is_test: false,
        },
        ...(displayName && displayName !== placeName
          ? { identity: { display_name: displayName } }
          : {}),
        ...(Object.keys(paletteOverride).length
          ? { menus: { style: paletteOverride } }
          : {}),
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      const scope = readKitchenOnboardingScope(rootData || {})
      const hasLegacyScope =
        Object.prototype.hasOwnProperty.call(rootData, 'app_scope_state') ||
        Object.prototype.hasOwnProperty.call(rootData, 'app_scope_app_id')
      if (
        scope.state !== current.appScopeState ||
        scope.appId !== current.appId ||
        hasLegacyScope
      ) {
        transaction.update(rootRef, {
          app_scope: {
            state: current.appScopeState,
            app_id: current.appId,
          },
          app_scope_state: FieldValue.delete(),
          app_scope_app_id: FieldValue.delete(),
          updated: serverAuditStamp({ by: current.uid }),
        })
      }
    }

    if (createdAppSupport) {
      transaction.create(supportRef, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else if (role === 'admin') {
      transaction.update(supportRef, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        ...(supportCandidate.missingFields.includes('join_requests')
          ? { join_requests: [] }
          : {}),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    transaction.update(current.membershipRef, {
      console_enabled: true,
      'console_targets.kitchen_ids': FieldValue.arrayUnion(locator.kitchenId),
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
      ...(createdRoot && Object.keys(paletteOverride).length
        ? { palette_override: paletteOverride }
        : {}),
    }
  })
}
