// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: define the bounded preview and completion contract.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: stage one optional sparse brand palette.
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { Place } from './place.model.ts'

export type PlaceUpsertInput = Partial<Place> &
  Pick<Place, 'id' | 'name' | 'place_type' | 'source'> & {
    image_shade?: 'light' | 'dark' | 'none'
  }

export type PlaceOnboardingDefaults = {
  default_currency_code: string
  timezone: string
}

export type PlaceOnboardingIdentity = {
  short_name: string
  tagline: string
}

export type PlaceOnboardingEnrichment = Partial<PlaceOnboardingIdentity> & {
  about?: string
  tags?: string[]
  id: string
  generated: boolean
}

export type PlaceOnboardingPreview = {
  id: string
  existing: boolean
  can_configure: boolean
  requires_defaults: boolean
  current?: Partial<PlaceOnboardingDefaults>
  suggestions?: Partial<PlaceOnboardingDefaults>
  image_url?: string
  logo_image?: string
  short_name?: string
  tagline?: string
  about?: string
  tags?: string[]
  cover_image?: string
  brand_palette?: SparseBrandPalette
}

export type PlaceOnboardingCompleteResult = {
  ok: true
  id: string
  created: boolean
  configured: boolean
  defaults: PlaceOnboardingDefaults
  image_url?: string
  brand_palette?: SparseBrandPalette
}

export type PlaceOnboardingCompleteInput = PlaceOnboardingDefaults & {
  id: string
  short_name?: string
  tagline?: string
  about?: string
  tags?: string[]
  cover_image?: string
  logo_image?: string
  image_url?: string
  brand_palette?: SparseBrandPalette
}
