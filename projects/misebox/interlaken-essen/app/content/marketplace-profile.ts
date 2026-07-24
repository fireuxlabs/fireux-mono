export const INTERLAKEN_ESSEN_APP_ID = 'interlaken-essen'
export const MARKETPLACE_PROFILE_COLLECTION = 'marketplace-profiles'

export const INTERLAKEN_LOCALITIES = [
  { id: 'interlaken', label: 'Interlaken', postalCode: '3800' },
  { id: 'matten', label: 'Matten b. Interlaken', postalCode: '3800' },
  { id: 'unterseen', label: 'Unterseen', postalCode: '3800' },
  { id: 'goldswil', label: 'Goldswil', postalCode: '3805' },
  { id: 'boenigen', label: 'Bönigen', postalCode: '3806' },
  { id: 'iseltwald', label: 'Iseltwald', postalCode: '3807' },
  { id: 'wilderswil', label: 'Wilderswil', postalCode: '3812' },
  { id: 'saxeten', label: 'Saxeten', postalCode: '3813' },
  { id: 'gsteigwiler', label: 'Gsteigwiler', postalCode: '3814' },
  { id: 'grindelwald', label: 'Grindelwald', postalCode: '3818' },
  { id: 'lauterbrunnen', label: 'Lauterbrunnen', postalCode: '3822' },
  { id: 'habkern', label: 'Habkern', postalCode: '3804' },
  { id: 'beatenberg', label: 'Beatenberg', postalCode: '3803' },
  { id: 'daerligen', label: 'Därligen', postalCode: '3707' },
  { id: 'leissigen', label: 'Leissigen', postalCode: '3706' },
  { id: 'ringgenberg', label: 'Ringgenberg', postalCode: '3852' },
  { id: 'brienz', label: 'Brienz', postalCode: '3855' },
] as const

export const OTHER_LOCALITY_ID = 'other'

export type InterlakenLocalityId =
  | (typeof INTERLAKEN_LOCALITIES)[number]['id']
  | typeof OTHER_LOCALITY_ID

export type MarketplaceOnboardingInput = {
  locality_id: InterlakenLocalityId
  locality_label?: string
  postal_code?: string
  offers_enabled: boolean
  public_name?: string
  introduction?: string
}

export type MarketplaceAccountSettings = {
  delivery_address: string
}

export type MarketplaceAccountSettingsInput = {
  delivery_address: string
}
