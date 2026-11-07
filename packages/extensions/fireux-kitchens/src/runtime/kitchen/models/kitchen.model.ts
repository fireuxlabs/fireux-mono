import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'
import type { KitchenConfiguration } from './kitchen-configuration.model'

export const KITCHEN_IDENTITY_SOURCES = ['user', 'place'] as const
export type KitchenIdentitySource = (typeof KITCHEN_IDENTITY_SOURCES)[number]

export const KITCHEN_STATUSES = ['active', 'inactive', 'archived'] as const
export type KitchenStatus = (typeof KITCHEN_STATUSES)[number]

/** Kitchen-specific identity. Shared establishment facts remain Place-owned. */
export type KitchenIdentity = {
  // Historical records may have no recorded onboarding origin.
  source?: KitchenIdentitySource
  slug: string
  status: KitchenStatus
  visibility: boolean
}

export type Kitchen = KitchenConfiguration & {
  id: string
  /** Internal operator background; omitted from public projections. */
  context?: string
  identity: KitchenIdentity
  created: FireuxCreatedStamp
  /** Creation may precede the first update; updates can retain App provenance. */
  updated?: FireuxUpdatedStamp & { app_id?: string }
}
/** Public identity and service presentation, without private root metadata. */
export type KitchenPublicSummary = Pick<Kitchen, 'id' | 'identity' | 'services'>
