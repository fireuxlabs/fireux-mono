import type { H3Event } from 'h3'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { readKitchenOnboardingActor } from './onboarding-actor'
import { resolveKitchenOnboardingTransactionLocator } from './locator'
import { assertKitchenOnboardingPlaceDefaults } from './onboarding-policy'
import { fail, readKitchenOnboardingRequest } from './request'
import { KitchenSystemMenuKinds } from '../../../../menu/utils/kitchen-system-menus.ts'
import { createKitchenSystemMenus } from './system-menus'
import type { KitchenDirectoryContributionResult } from '../../../models/kitchen-onboarding.model.ts'

/** Directory contribution never grants Team authority or an AppUser association. */
export async function contributeKitchenDirectory(
  event: H3Event,
  input: unknown
): Promise<KitchenDirectoryContributionResult> {
  const body = readKitchenOnboardingRequest(input, ['place_id', 'name'])
  const name = String(body.name || '').trim()
  const unlisted = 'name' in body
  if (unlisted && (body.place_id || !name || name.length > 120)) {
    fail(
      400,
      'Enter a kitchen name of 120 characters or fewer, or choose a listed location.'
    )
  }
  const actor = await readKitchenOnboardingActor(event)
  if (!actor.canCreate)
    fail(403, 'Kitchen contribution is disabled for this App.')
  const { kitchenId, placeId } = unlisted
    ? (() => {
        const id = requireFirestoreDocumentId(
          resolveWorkspaceEntityCreationId({
            intent: 'create_shell',
            ownerUserId: actor.uid,
          }),
          'Kitchen id'
        )
        return { kitchenId: id, placeId: id }
      })()
    : resolveKitchenOnboardingTransactionLocator(body)
  const menus = serverKitchenMenusTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [place, kitchen, systemMenus] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.places, placeId),
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.readMany(menus, KitchenSystemMenuKinds),
    ])
    if (kitchen.exists) {
      return {
        ok: true,
        kitchen_id: kitchenId,
        created_root: false,
        slug: String(kitchen.data?.slug || ''),
      }
    }
    if (unlisted && place.exists)
      fail(
        409,
        'An existing location uses this identity. Find it in search to continue.'
      )
    if (!unlisted && !place.exists)
      fail(409, 'Confirm the kitchen location first.')
    if (!unlisted) assertKitchenOnboardingPlaceDefaults(place.data || {})
    const slug = normalizeSlug(
      unlisted ? name : String(place.data?.name || kitchenId)
    )
    const created = serverAuditStamp({ by: actor.uid, appId: actor.appId })
    const updated = serverAuditStamp({ by: actor.uid })
    if (unlisted) {
      mutations.create(FIRESTORE_MUTATION_TARGETS.places, placeId, {
        name,
        slug,
        place_type: 'non_physical',
        entity_families: ['kitchen'],
        created,
        updated,
      })
    }
    mutations.create(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      identity_source: unlisted ? 'user' : 'place',
      currency: unlisted ? '' : String(place.data?.default_currency_code || '').trim().toUpperCase(),
      slug,
      status: 'active',
      visibility: true,
      created,
      updated,
    })
    createKitchenSystemMenus({
      mutations,
      target: menus,
      kitchenId,
      menus: systemMenus,
      created,
      updated,
    })
    return { ok: true, kitchen_id: kitchenId, created_root: true, slug }
  })
}
