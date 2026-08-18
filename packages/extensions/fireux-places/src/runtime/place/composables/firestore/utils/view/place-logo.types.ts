import type { BasePlace } from '../../../../models/place.model.ts'
import type { ComputedRef, Ref } from 'vue'
import type { PlaceCard } from './usePlaceInterface.ts'

export type PlaceLogoTarget = PlaceCard.Card | BasePlace

export type SanitizedAvatar = string | null

export interface UsePlaceLogoStateOptions {
  timeoutMs?: number
  autoHydrate?: boolean
  priority?: boolean
  shouldHydrate?: (
    place: PlaceLogoTarget,
    currentAvatar: SanitizedAvatar
  ) => boolean
  emptyMessage?: string | null
}

export interface HydrateLogoOptions {
  timeoutMs?: number
  priority?: boolean
  forceReload?: boolean
  emptyMessage?: string | null
}

export interface PlaceLogoState {
  avatar: Ref<string | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasAttempted: Ref<boolean>
  canHydrate: ComputedRef<boolean>
  hydrate: (overrides?: HydrateLogoOptions) => Promise<string | null>
  retry: (overrides?: HydrateLogoOptions) => Promise<string | null>
  cancel: () => void
}

export interface PlaceDetailsResult {
  website?: string | null
  url?: string | null
}

export interface LoadLogoOptions {
  priority?: boolean
  forceReload?: boolean
  timeoutMs?: number
}
