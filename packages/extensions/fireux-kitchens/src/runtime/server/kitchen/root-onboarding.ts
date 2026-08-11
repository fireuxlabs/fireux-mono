import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverRuntimeUserTargetsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { compactBrandPalette, parseBrandPalette, readBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { KitchenOnboardingCompleteResult } from '../../models/kitchen-onboarding.model'
import { KITCHEN_CONSOLE_TARGET_LIMIT } from '../../models/kitchen/kitchen-index.model'
import {
  assertKitchenOnboardingPlaceDefaults,
  kitchenOnboardingSlugCandidates,
  onboardingRecord as record,
  onboardingText as text,
} from './onboarding-policy'
import { kitchenRootTarget } from './firestore-targets'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Kitchen onboarding request must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = new Set(['place_id', 'display_name', 'palette_override'])
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    fail(400, `Kitchen onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

/** Create independent Kitchen truth. App attachment is a separate command. */
export async function completeKitchenRootOnboarding(
  event: H3Event,
  input: unknown
): Promise<KitchenOnboardingCompleteResult> {
  const body = request(input)
  const placeId = requireFirestoreDocumentId(body.place_id, 'Place id')
  const displayName = text(body.display_name)
  if (displayName.length > 120) fail(400, 'Kitchen name is too long.')
  const requestedPalette = parseBrandPalette(body.palette_override)
  if ('error' in requestedPalette) fail(400, requestedPalette.error)

  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const rootReference = db.collection('kitchens').doc(placeId)
  const matchingRoot = await db
    .collection('kitchens')
    .where('place_id', '==', placeId)
    .limit(2)
    .get()
  if (matchingRoot.docs.some(document => document.id !== placeId)) {
    fail(409, 'This Place has a Kitchen with a non-canonical id.')
  }
  if ((await rootReference.get()).exists) {
    fail(409, 'This Place already has a canonical Kitchen.')
  }

  const userTargets = serverRuntimeUserTargetsTarget(uid)
  return runGuardedServerTransaction({ kind: 'runtime' }, async mutations => {
    const [place, root, targets] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, placeId),
      mutations.read(kitchenRootTarget, placeId),
      mutations.read(userTargets, 'targets'),
    ])
    if (!place.exists) fail(409, 'The linked Place does not exist.')
    if (root.exists) fail(409, 'This Place already has a canonical Kitchen.')
    if (text(record(place.data?.created).by) !== uid) {
      fail(403, 'Only the Place creator can create its independent Kitchen.')
    }
    assertKitchenOnboardingPlaceDefaults(place.data || {})

    const placeName = text(place.data?.name)
    const candidates = kitchenOnboardingSlugCandidates(placeName, placeId)
    const matches = await mutations.query<Record<string, unknown>>(
      kitchenRootTarget,
      {
        field: 'slug',
        op: candidates.length === 1 ? '==' : 'in',
        value: candidates.length === 1 ? candidates[0] : candidates,
        limit: candidates.length,
      }
    )
    const used = new Set(matches.map(match => text(match.data.slug)))
    const slug = candidates.find(candidate => !used.has(candidate)) || ''
    if (!slug) fail(409, 'No unique Kitchen route is available.')

    const placePalette = readBrandPalette(place.data?.brand_palette)
    const paletteOverride = compactBrandPalette(
      requestedPalette.value,
      placePalette
    )
    mutations.create(kitchenRootTarget, placeId, {
      place_id: placeId,
      slug,
      status: 'active',
      visibility: false,
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
      brand_palette: paletteOverride,
      created: serverAuditStamp({ by: uid }),
      updated: serverAuditStamp({ by: uid }),
    })

    const currentIds = targets.exists ? targets.data?.kitchen_ids : []
    if (!Array.isArray(currentIds) || currentIds.some(id => !text(id))) {
      fail(409, 'Kitchen target index has an invalid stored shape.')
    }
    if (new Set([...currentIds.map(text), placeId]).size > KITCHEN_CONSOLE_TARGET_LIMIT) {
      fail(409, 'Kitchen console targets exceed the supported limit.')
    }
    if (targets.exists) {
      mutations.update(userTargets, 'targets', {
        kitchen_ids: FieldValue.arrayUnion(placeId),
      })
    } else {
      mutations.create(userTargets, 'targets', {
        project_ids: [],
        kitchen_ids: [placeId],
      })
    }

    return {
      ok: true,
      kitchen_id: placeId,
      place_id: placeId,
      action: 'create',
      created_root: true,
      created_app_support: false,
      slug,
      ...(Object.keys(paletteOverride).length
        ? { palette_override: paletteOverride }
        : {}),
    }
  })
}
