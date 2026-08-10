// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: define the bounded preview and completion contract.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: stage one optional sparse brand palette.
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { PlaceAssets } from './place.model'

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
  assets?: Pick<PlaceAssets, 'image'>
  brand_palette?: SparseBrandPalette
}

export type PlaceOnboardingCompleteResult = {
  ok: true
  id: string
  created: boolean
  configured: boolean
  defaults: PlaceOnboardingDefaults
  assets?: Pick<PlaceAssets, 'image'>
  brand_palette?: SparseBrandPalette
}

export type PlaceOnboardingCompleteInput = PlaceOnboardingDefaults & {
  id: string
  assets?: Pick<PlaceAssets, 'image'>
  brand_palette?: SparseBrandPalette
}

export type PlaceManualCreateInput = Partial<PlaceOnboardingDefaults> & {
  name: string
  street?: string
  city?: string
  region?: string
  postal_code?: string
  country_code?: string
  lat?: number
  lng?: number
}

export type PlaceManualCreateResult = {
  ok: true
  id: string
  created: true
}
