export const KITCHEN_IDENTITY_SOURCES = ['user', 'place'] as const
export type KitchenIdentitySource = (typeof KITCHEN_IDENTITY_SOURCES)[number]

/** Kitchen-specific identity. Shared establishment facts remain Place-owned. */
export type KitchenIdentity = {
  // Historical records may have no recorded onboarding origin.
  source?: KitchenIdentitySource
  slug: string
  status: 'active' | 'inactive' | 'archived'
  visibility: boolean
}

export type Kitchen = {
  id: string
  identity: KitchenIdentity
  tables?: { count: number }
}
