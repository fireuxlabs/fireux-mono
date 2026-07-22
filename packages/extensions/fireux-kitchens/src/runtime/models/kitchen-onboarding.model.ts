// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: define the bounded preview and atomic completion contract.
// Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: define a sparse root override over Place colours.
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'

export type KitchenOnboardingAction =
  | 'create'
  | 'connect'
  | 'open'
  | 'request_access'

export type KitchenOnboardingPreview = {
  kitchen_id: string
  place_id: string
  existing: boolean
  connected: boolean
  can_complete: boolean
  action: KitchenOnboardingAction
  message?: string
  display_name?: string
  published?: boolean
  slug?: string
  palette_override?: SparseBrandPalette
}

export type KitchenOnboardingCompleteInput = {
  place_id: string
  kitchen_id?: string
  display_name?: string
  palette_override?: SparseBrandPalette
}

export type KitchenOnboardingCompleteResult = {
  ok: true
  kitchen_id: string
  place_id: string
  action: Exclude<KitchenOnboardingAction, 'request_access'>
  created_root: boolean
  created_app_support: boolean
  slug?: string
  palette_override?: SparseBrandPalette
}
