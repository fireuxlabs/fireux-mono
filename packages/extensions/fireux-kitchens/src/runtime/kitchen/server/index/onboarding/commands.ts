// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: atomically bind Place, Kitchen root, and App access.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: require exact root scope and access-only App support.
// Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: persist only root colours differing from the linked Place.
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppKitchensTarget,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  appPaletteLayersEqual,
  compactBrandPalette,
  compactAppPalette,
  consolePaletteFromApp,
  parseBrandPalette,
  readAppPalette,
  readAppPaletteLayer,
  readBrandPalette,
  readConsolePalette,
} from 'fireux-core/runtime/utils/brand-palette'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../models/kitchen-onboarding.model.ts'
import {
  AppKitchenStorage,
  KitchenStorage,
} from '../../../models/kitchen.model.ts'
import {
  assertKitchenOnboardingPlaceDefaults,
  assertKitchenOnboardingManagement,
  assertKitchenOnboardingSupportCapacity,
  kitchenOnboardingAccessDecision,
  onboardingRecord as record,
  onboardingText as text,
  readKitchenOnboardingManagement,
  readKitchenOnboardingSupport,
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
  const collection = db.collection(KitchenStorage.collection)
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
    const snapshot = await db
      .collection(KitchenStorage.collection)
      .doc(kitchenId)
      .get()
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
  if (locator.kitchen)
    assertKitchenOnboardingManagement(
      locator.kitchen,
      current.appId,
      current.ecosystem
    )

  const [place, support] = await Promise.all([
    current.db.collection(PlaceStorage.collection).doc(locator.placeId).get(),
    current.db
      .doc(
        `apps/${current.appId}/${AppKitchenStorage.collection}/${locator.kitchenId}`
      )
      .get(),
  ])
  if (!place.exists) fail(409, 'The linked Place does not exist.')
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
  const displayName = text(identity.name)
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
  const current = await actor(event)
  const locator = await resolveLocator(current.db, body)
  const memberships = serverAppUsersTarget(current.appId)
  const supports = serverAppKitchensTarget(current.appId)
  const teamMembers = serverKitchenTeamMembersTarget(
    current.appId,
    locator.kitchenId
  )

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [membership, user, app, place, root, support] = await Promise.all([
      mutations.read(memberships, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeApps, current.appId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, locator.placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId),
      mutations.read(supports, locator.kitchenId),
    ])
    const role = memberRole(membership.exists, membership.data?.role)
    if (!place.exists) fail(409, 'The linked Place no longer exists.')
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const rootData = root.exists ? root.data || {} : null
    if (rootData) {
      assertKitchenOnboardingManagement(
        rootData,
        current.appId,
        current.ecosystem
      )
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

    const createdRoot = !root.exists
    const createdAppSupport = !support.exists
    const placeName = text(place.data?.name)
    const slug =
      text(rootData?.slug) || normalizeSlug(placeName || locator.kitchenId)
    const placePalette = readBrandPalette(place.data?.brand_palette)
    const paletteOverride = compactBrandPalette(
      requestedPalette.value,
      placePalette
    )
    const storedAppPaletteValue = record(record(app.data?.theme).palette)
    const appPalette =
      current.configuredAppPalette || readAppPalette(storedAppPaletteValue)
    const storedAppPaletteLayer = readAppPaletteLayer(storedAppPaletteValue)
    const storedConsole = record(supportData?.console)
    const storedTheme = record(storedConsole.theme)
    const existingConsolePalette = readConsolePalette(storedTheme.palette)
    const maySeedConsole = createdAppSupport || role === 'admin'
    const consolePalette =
      existingConsolePalette ||
      (appPalette && maySeedConsole ? consolePaletteFromApp(appPalette) : null)
    const inheritedConsoleTheme = appPalette
      ? { palette: consolePaletteFromApp(appPalette) }
      : null
    const compactAppLayer =
      appPalette && consolePalette
        ? compactAppPalette(appPalette, consolePalette)
        : null

    if (!createdRoot && Object.keys(requestedPalette.value).length) {
      fail(409, 'Existing Kitchen colours are preserved during onboarding.')
    }

    const creatorName = text(user.data?.display_name) || current.authDisplayName
    if (createdRoot && !creatorName) {
      fail(409, 'Finish your User name before creating a Kitchen.')
    }

    if (createdRoot) {
      mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, locator.kitchenId, {
        slug,
        visibility: false,
        management: current.management,
        identity: {
          name: displayName && displayName !== placeName ? displayName : '',
          tagline: '',
        },
        assets: {
          image: '',
          logo: '',
          wordmark: '',
          backdrop_color: '',
        },
        ...(Object.keys(paletteOverride).length
          ? { brand_palette: paletteOverride }
          : {}),
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      const management = readKitchenOnboardingManagement(rootData || {})
      if (JSON.stringify(management) !== JSON.stringify(current.management)) {
        fail(409, 'Kitchen management does not match this App.')
      }
    }

    if (createdAppSupport) {
      mutations.create(supports, locator.kitchenId, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        console: inheritedConsoleTheme ? { theme: inheritedConsoleTheme } : {},
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else if (role === 'admin') {
      mutations.update(supports, locator.kitchenId, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        ...(inheritedConsoleTheme && !readConsolePalette(storedTheme.palette)
          ? { 'console.theme': inheritedConsoleTheme }
          : {}),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    if (createdRoot) {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          appId: current.appId,
          createdBy: current.uid,
          kitchenId: locator.kitchenId,
          memberId: current.uid,
          name: creatorName,
          slug: normalizeSlug(creatorName) || 'team-member',
          userId: current.uid,
        })
      )
    }

    if (
      compactAppLayer &&
      (!storedAppPaletteLayer ||
        !appPaletteLayersEqual(storedAppPaletteLayer, compactAppLayer))
    ) {
      mutations.update(FIRESTORE_MUTATION_TARGETS.runtimeApps, current.appId, {
        'theme.palette': compactAppLayer,
        updated: serverAuditStamp({ by: current.uid }),
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
      ...(createdRoot && Object.keys(paletteOverride).length
        ? { palette_override: paletteOverride }
        : {}),
    }
  })
}
