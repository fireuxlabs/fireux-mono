import type {
  PlaceOnboardingEnrichment,
  PlaceUpsertInput,
} from '../models/place-onboarding.model.ts'
import type { OnboardingStep } from 'fireux-core/runtime/composables/shared/useOnboarding'

export type PlaceOnboardingStepId =
  | 'find'
  | 'defaults'
  | 'identity'
  | 'discovery'
  | 'brand'
  | 'review'

export type PlaceOnboardingSelection = {
  placeId: string
  place: PlaceUpsertInput
}

export type PlaceOnboardingResult = {
  id: string
  path: string
}

export const placeOnboardingText = (value: unknown) =>
  String(value ?? '').trim()

export function hasPhysicalPlaceLocation(place: PlaceUpsertInput | null) {
  if (!place) return false
  const lat = Number(place.lat)
  const lng = Number(place.lng)
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
  )
}

export function placeOnboardingErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as {
      data?: { statusMessage?: unknown; message?: unknown }
      statusMessage?: unknown
      message?: unknown
    }
    const message = placeOnboardingText(
      candidate.data?.statusMessage ||
        candidate.data?.message ||
        candidate.statusMessage ||
        candidate.message
    )
    if (message) return message
  }
  return 'Unable to add this Place right now.'
}

export async function enrichPlaceDraft(
  place: PlaceUpsertInput,
  id: string,
  enrichIdentity: (id: string) => Promise<PlaceOnboardingEnrichment>
) {
  const [identity, logo] = await Promise.all([
    enrichIdentity(id).catch(() => null),
    placeOnboardingText(place.website) &&
    !placeOnboardingText(place.image_url) &&
    !placeOnboardingText(place.logo_image)
      ? $fetch<{ url: string | null }>('/api/places/logo', {
          query: { website: placeOnboardingText(place.website) },
        }).catch(() => null)
      : Promise.resolve(null),
  ])

  return {
    ...place,
    ...(!placeOnboardingText(place.short_name) && identity?.short_name
      ? { short_name: identity.short_name }
      : {}),
    ...(!placeOnboardingText(place.tagline) && identity?.tagline
      ? { tagline: identity.tagline }
      : {}),
    ...(!placeOnboardingText(place.about) && identity?.about
      ? { about: identity.about }
      : {}),
    ...(!place.tags?.length && identity?.tags?.length
      ? { tags: identity.tags }
      : {}),
    ...(!placeOnboardingText(place.logo_image) && logo?.url
      ? { logo_image: logo.url }
      : {}),
  }
}

export function placeOnboardingSteps(options: {
  needsDefaults: boolean
  needsIdentity: boolean
  needsDiscovery: boolean
  canAddBrand: boolean
  validateFind: () => true | string
  validateDefaults: () => true | string
  validateIdentity: () => true | string
  validateDiscovery: () => true | string
  validateBrand: () => true | string
  validateReview: () => true | string
}): readonly OnboardingStep<PlaceOnboardingStepId>[] {
  return [
    {
      id: 'find',
      label: 'Find the Place',
      description: 'Search the shared Place directory and Google Places.',
      icon: 'i-lucide-search',
      validate: options.validateFind,
    },
    ...(options.needsDefaults
      ? [
          {
            id: 'defaults' as const,
            label: 'Local defaults',
            description:
              'Confirm the currency and local timezone inherited from this Place.',
            icon: 'i-lucide-settings-2',
            validate: options.validateDefaults,
          },
        ]
      : []),
    ...(options.needsIdentity
      ? [
          {
            id: 'identity' as const,
            label: 'Identity',
            description:
              'Review the suggested short name and factual introduction.',
            icon: 'i-lucide-sparkles',
            validate: options.validateIdentity,
          },
        ]
      : []),
    ...(options.needsDiscovery
      ? [
          {
            id: 'discovery' as const,
            label: 'Discovery',
            description:
              'Review the public introduction, categories, and venue photography.',
            icon: 'i-lucide-images',
            validate: options.validateDiscovery,
          },
        ]
      : []),
    ...(options.canAddBrand
      ? [
          {
            id: 'brand' as const,
            label: 'Brand',
            description: 'Add an optional logo and shared Place colours.',
            icon: 'i-lucide-palette',
            validate: options.validateBrand,
          },
        ]
      : []),
    {
      id: 'review',
      label: 'Review',
      description: 'Review the shared identity and confirmed local defaults.',
      icon: 'i-lucide-check-circle-2',
      validate: options.validateReview,
    },
  ]
}
