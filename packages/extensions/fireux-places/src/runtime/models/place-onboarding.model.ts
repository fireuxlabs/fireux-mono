// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: define the bounded preview and completion contract.

export type PlaceOnboardingDefaults = {
  default_currency_code: string
  timezone: string
}

export type PlaceOnboardingPreview = {
  id: string
  existing: boolean
  can_configure: boolean
  requires_defaults: boolean
  current?: Partial<PlaceOnboardingDefaults>
  suggestions?: Partial<PlaceOnboardingDefaults>
  image_url?: string
}

export type PlaceOnboardingCompleteResult = {
  ok: true
  id: string
  created: boolean
  configured: boolean
  defaults: PlaceOnboardingDefaults
  image_url?: string
}

export type PlaceOnboardingCompleteInput = PlaceOnboardingDefaults & {
  id: string
  image_url?: string
}
