import type { Kitchen } from '../../runtime/kitchen/models/kitchen.model'
import type {
  KitchenPublicSummary,
  KitchenDirectoryEntry,
  KitchenDetailResponse,
} from '../../runtime/kitchen/types/public'
import type {
  KitchenCard,
  KitchenSurface,
} from '../../runtime/kitchen/types/presentation'
import { useKitchenInterface } from '../../runtime/kitchen/composables/useKitchenInterface'
import { normalizeKitchen } from '../../runtime/kitchen/utils/normalize-kitchen'
import { toKitchenCollectionCell } from '../../runtime/kitchen/utils/kitchen-interface-projection'
import { PlaceDefaults } from 'fireux-places/runtime/place/utils/normalize-place'

const kitchen: Kitchen = {
  id: 'venue',
  identity: {
    source: 'place',
    slug: 'venue',
    status: 'active',
    visibility: true,
  },
  created: {
    at: { seconds: 1, nanoseconds: 0 },
    by: 'operator',
    app_id: 'app',
  },
  context: 'Private operator notes',
  guidance_ids: ['service'],
  orders: { printing: { ticket_device_id: 'printer' } },
}
const place = { ...PlaceDefaults, id: kitchen.id, name: 'Venue' }
const summary: KitchenPublicSummary | null = normalizeKitchen(
  kitchen.id,
  kitchen,
  place
)
if (summary) {
  const directory: KitchenDirectoryEntry = {
    ...summary,
    service_labels: ['Browse menus'],
    has_published_menu: true,
  }
  const detail: KitchenDetailResponse = {
    kitchen: summary,
    place,
    presentation: {
      id: kitchen.id,
      slug: kitchen.identity.slug,
      name: place.name,
      display_name: place.name,
      visible: true,
      route_scope: 'live',
      offerings: [],
    },
  }
  const { surface, interface: card } = useKitchenInterface()
  const view: KitchenSurface | null = surface({ kitchen: directory, place })
  const mapped: KitchenCard | null = card(view)
  if (mapped) toKitchenCollectionCell(mapped)
  void detail

  // @ts-expect-error Directory enrichment is guaranteed, not optional.
  const incompleteDirectory: KitchenDirectoryEntry = summary
  const privateSummary: KitchenPublicSummary = {
    ...summary,
    // @ts-expect-error Public summaries cannot carry private Kitchen context.
    context: 'private',
  }
  // @ts-expect-error Place display fields do not belong to canonical Kitchen input.
  surface({ kitchen: { ...kitchen, name: 'Copied Place name' }, place })
  // @ts-expect-error A projected view does not preserve arbitrary caller fields.
  view?.callerOnlyField
  void [incompleteDirectory, privateSummary]
}

// @ts-expect-error Publication states are Kitchen-owned vocabulary.
export const invalidStatus: Kitchen['identity']['status'] = 'published'
// @ts-expect-error Kitchen has no flat visibility field.
export const flatIdentity: Kitchen = { ...kitchen, visibility: true }
// @ts-expect-error An unknown onboarding origin is not inferred or admitted.
export const invalidOrigin: Kitchen['identity']['source'] = 'google'
// @ts-expect-error Collection display facts are strings, not permissive bags.
export const invalidCardLabels: KitchenCard['serviceLabels'] = [42]
// @ts-expect-error Public directory flags are booleans.
export const invalidPublished: KitchenDirectoryEntry['has_published_menu'] =
  'yes'

type Assert<T extends true> = T
export type RootHasNoPlace = Assert<
  'place' extends keyof Kitchen ? false : true
>
export type PublicHasNoStamps = Assert<
  'created' extends keyof KitchenPublicSummary ? false : true
>
export type SurfaceHasNoRootFulfilment = Assert<
  'fulfilment' extends keyof KitchenSurface ? false : true
>
