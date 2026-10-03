import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type {
  PlaceOnboardingCompleteInput,
  PlaceUpsertInput,
} from '../models/place-onboarding.model.ts'
import { canonicalPlaceId } from '../composables/firestore/fetch/google/usePlacesGoogle'
import {
  placeOnboardingErrorMessage,
  placeOnboardingText as text,
  type PlaceOnboardingResult,
} from './place-onboarding'

interface PlaceOnboardingCompletionOptions {
  draft: PlaceUpsertInput | null
  isCurrent?: () => boolean
  needsEnrichment: boolean
  requiredOnly?: boolean
  currencyCode: string
  timezone: string
  brandPalette: SparseBrandPalette
  imageFile: File | null
  coverFile: File | null
  ensurePlaceExists: (input: { id: string }) => Promise<unknown>
  completePlaceOnboarding: (
    input: PlaceOnboardingCompleteInput
  ) => Promise<unknown>
  uploadImage: (path: string, file: File) => Promise<string>
}

export async function completePlaceDraft({
  draft: originalDraft,
  isCurrent = () => true,
  needsEnrichment,
  requiredOnly = false,
  currencyCode,
  timezone,
  brandPalette: originalPalette,
  imageFile,
  coverFile,
  ensurePlaceExists,
  completePlaceOnboarding,
  uploadImage,
}: PlaceOnboardingCompletionOptions): Promise<PlaceOnboardingResult> {
  const draft = originalDraft ? JSON.parse(JSON.stringify(originalDraft)) as PlaceUpsertInput : null
  const brandPalette = JSON.parse(JSON.stringify(originalPalette)) as SparseBrandPalette
  const id = canonicalPlaceId(draft?.id)
  if (!id) throw new Error('Choose a Place before continuing.')

  try {
    if (!isCurrent()) throw new Error('The Place setup changed. Reopen setup.')
    if (!needsEnrichment) {
      const ensured = await ensurePlaceExists({ id })
      if (!ensured) throw new Error('The Place could not be confirmed.')
    } else {
      const defaults: PlaceOnboardingCompleteInput = {
        id,
        default_currency_code: currencyCode,
        timezone,
        ...(text(draft?.short_name)
          ? { short_name: text(draft?.short_name) }
          : {}),
        ...(text(draft?.tagline) ? { tagline: text(draft?.tagline) } : {}),
        ...(text(draft?.about) ? { about: text(draft?.about) } : {}),
        ...(draft?.tags?.length ? { tags: draft.tags } : {}),
        ...(text(draft?.logo_image)
          ? { logo_image: text(draft?.logo_image) }
          : {}),
        ...(Object.keys(brandPalette).length
          ? { brand_palette: brandPalette }
          : {}),
      }
      if (requiredOnly) {
        await completePlaceOnboarding({
          id,
          default_currency_code: currencyCode,
          timezone,
        })
        return { id, path: `/places/${encodeURIComponent(id)}` }
      }
      await completePlaceOnboarding(defaults)

      if (!isCurrent()) return { id, path: `/places/${encodeURIComponent(id)}` }
      if (imageFile) {
        const imageUrl = await uploadImage(`places/${id}/avatar`, imageFile)
        if (!isCurrent()) return { id, path: `/places/${encodeURIComponent(id)}` }
        await completePlaceOnboarding({ ...defaults, image_url: imageUrl })
      }
      if (!isCurrent()) return { id, path: `/places/${encodeURIComponent(id)}` }
      if (coverFile) {
        const coverImage = await uploadImage(`places/${id}/cover`, coverFile)
        if (!isCurrent()) return { id, path: `/places/${encodeURIComponent(id)}` }
        await completePlaceOnboarding({ ...defaults, cover_image: coverImage })
      }
    }
    return { id, path: `/places/${encodeURIComponent(id)}` }
  } catch (error) {
    throw new Error(placeOnboardingErrorMessage(error))
  }
}
