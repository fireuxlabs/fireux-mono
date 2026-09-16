export const KITCHEN_IDENTITY_SOURCES = ['user', 'place'] as const
export type KitchenIdentitySource = (typeof KITCHEN_IDENTITY_SOURCES)[number]

export type Kitchen = {
  id: string
  currency: string
  identity_source: KitchenIdentitySource
  slug: string
  status: 'active' | 'inactive' | 'archived'
  visibility: boolean
}
