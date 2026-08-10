// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: confirm local defaults and stage optional branding before trusted completion.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: stage sparse brand colours without copying inherited defaults.
// Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: expose the singular Place domain adapter over usePlaceCreate.
import { useOnboarding, type OnboardingStep } from 'fireux-core/runtime/composables/shared/useOnboarding'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import { parseBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import { computed, ref } from 'vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../firestore/place/fetch/google/usePlacesGoogle'
import { usePlaceCreate } from '../firestore/place/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from '../../../models/place.model'
import type { PlaceOnboardingPreview } from '../../../models/place-onboarding.model'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../../../utils/place-spine'

export type PlaceOnboardingStepId =
  | 'find'
  | 'defaults'
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

const text = (value: unknown) => String(value ?? '').trim()

function hasPhysicalLocation(place: PlaceUpsertInput | null) {
  if (!place) return false
  const lat = Number(place.lat)
  const lng = Number(place.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
}

function errorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as {
      data?: { statusMessage?: unknown; message?: unknown }
      statusMessage?: unknown
      message?: unknown
    }
    const message = text(
      candidate.data?.statusMessage ||
      candidate.data?.message ||
      candidate.statusMessage ||
      candidate.message
    )
    if (message) return message
  }
  return 'Unable to add this Place right now.'
}

export function usePlaceOnboarding() {
  const draft = ref<PlaceUpsertInput | null>(null)
  const selectionKind = ref<'provider' | 'existing' | null>(null)
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<PlaceOnboardingResult | null>(null)
  const preview = ref<PlaceOnboardingPreview | null>(null)
  const imageFile = ref<File | null>(null)
  let selectionSequence = 0
  const {
    completePlaceOnboarding,
    ensurePlaceExists,
    previewPlaceOnboarding,
  } = usePlaceCreate()
  const { uploadImage } = useImageStorage()

  const isExisting = computed(() => selectionKind.value === 'existing')
  const canConfigure = computed(() => preview.value?.can_configure === true)
  const needsDefaults = computed(() => Boolean(
    preview.value &&
    canConfigure.value &&
    preview.value.requires_defaults
  ))
  const canAddBrand = computed(() => Boolean(
    preview.value &&
    canConfigure.value &&
    (!preview.value.image_url || !preview.value.brand_palette)
  ))
  const needsEnrichment = computed(() => Boolean(
    needsDefaults.value || canAddBrand.value
  ))
  const canEditImage = computed(() => Boolean(
    canAddBrand.value && !preview.value?.image_url
  ))
  const canEditBrandPalette = computed(() => Boolean(
    canAddBrand.value && !preview.value?.brand_palette
  ))
  const brandPalette = computed<SparseBrandPalette>(() =>
    draft.value?.brand_palette || {}
  )
  const currencyCode = computed(() =>
    text(draft.value?.default_currency_code).toUpperCase().slice(0, 3)
  )
  const timezone = computed(() => text(draft.value?.timezone))
  const validatedCurrencyCode = computed(() =>
    normalizePlaceCurrencyCode(currencyCode.value)
  )
  const validatedTimezone = computed(() =>
    normalizePlaceTimezone(timezone.value)
  )

  function validateFind() {
    if (selectionPending.value) return 'Wait while we confirm this Place.'
    if (selectionError.value) return selectionError.value
    if (!draft.value) return 'Choose a Place before continuing.'
    return true
  }

  function validateSelection() {
    if (!draft.value || !text(draft.value.name)) {
      return 'Place name is required.'
    }
    if (!isExisting.value && !hasPhysicalLocation(draft.value)) {
      return 'Choose a physical Place with a confirmed location.'
    }
    return true
  }

  function validateDefaults() {
    if (!needsDefaults.value) return true
    if (!validatedCurrencyCode.value) return 'Confirm a 3-letter currency code.'
    if (!validatedTimezone.value) {
      return 'Confirm a valid IANA timezone, such as Europe/Zurich.'
    }
    return true
  }

  function validateBrand() {
    const result = parseBrandPalette(brandPalette.value)
    return result.ok ? true : result.error
  }

  const steps = computed<readonly OnboardingStep<PlaceOnboardingStepId>[]>(() => [
    {
      id: 'find',
      label: 'Find the Place',
      description: 'Search the shared Place directory and Google Places.',
      icon: 'i-lucide-search',
      validate: validateFind,
    },
    ...(needsDefaults.value
      ? [
          {
            id: 'defaults' as const,
            label: 'Local defaults',
            description: 'Confirm the currency and local timezone inherited from this Place.',
            icon: 'i-lucide-settings-2',
            validate: validateDefaults,
          },
        ]
      : []),
    ...(canAddBrand.value
      ? [
          {
            id: 'brand' as const,
            label: 'Brand',
            description: 'Add an optional logo and shared Place colours.',
            icon: 'i-lucide-palette',
            validate: validateBrand,
          },
        ]
      : []),
    {
      id: 'review',
      label: 'Review',
      description: 'Review the shared identity and confirmed local defaults.',
      icon: 'i-lucide-check-circle-2',
      validate: () => {
        const selection = validateSelection()
        if (selection !== true) return selection
        const defaults = validateDefaults()
        return defaults === true ? validateBrand() : defaults
      },
    },
  ])

  async function finish() {
    const id = canonicalPlaceId(draft.value?.id)
    if (!id) throw new Error('Choose a Place before continuing.')

    try {
      if (!needsEnrichment.value) {
        const ensured = await ensurePlaceExists({ id })
        if (!ensured) throw new Error('The Place could not be confirmed.')
      } else {
        const defaults = {
          id,
          default_currency_code: validatedCurrencyCode.value,
          timezone: validatedTimezone.value,
          ...(Object.keys(brandPalette.value).length
            ? { brand_palette: brandPalette.value }
            : {}),
        }
        await completePlaceOnboarding(defaults)

        if (imageFile.value) {
          const imageUrl = await uploadImage(
            `places/${id}/image`,
            imageFile.value
          )
          await completePlaceOnboarding({
            ...defaults,
            image_url: imageUrl,
          })
        }
      }
      completion.value = {
        id,
        path: `/places/${encodeURIComponent(id)}`,
      }
      return true
    } catch (error) {
      throw new Error(errorMessage(error))
    }
  }

  const onboarding = useOnboarding<PlaceOnboardingStepId>({
    steps,
    initialStepId: 'find',
    onFinish: finish,
  })

  async function selectPlace(selection: PlaceOnboardingSelection) {
    const sequence = ++selectionSequence
    onboarding.reset()
    completion.value = null
    selectionError.value = ''
    selectionPending.value = true
    preview.value = null
    imageFile.value = null

    const id = canonicalPlaceId(selection.placeId || selection.place.id)
    const providerSelection = selection.place.source === 'google'
    selectionKind.value = providerSelection ? 'provider' : 'existing'
    draft.value = null

    if (!id) {
      selectionError.value = 'This Place has no stable identity.'
      selectionPending.value = false
      return
    }

    try {
      if (providerSelection) {
        const details = await fetchPlaceDetails(id)
        if (sequence !== selectionSequence) return
        if (!details?.stored) {
          selectionError.value = 'We could not load this Place from Google.'
          return
        }

        draft.value = {
          ...selection.place,
          ...details.stored,
          id,
          name: text(details.stored.name || selection.place.name),
          place_type: 'physical',
        }
      } else {
        draft.value = { ...selection.place, id }
      }

      const resolvedPreview = await previewPlaceOnboarding(id)
      if (sequence !== selectionSequence) return
      preview.value = resolvedPreview
      selectionKind.value = resolvedPreview.existing ? 'existing' : 'provider'
      const current = resolvedPreview.current || {}
      const suggestions = resolvedPreview.suggestions || {}
      draft.value = {
        ...(draft.value || selection.place),
        ...(current.default_currency_code || suggestions.default_currency_code
          ? {
              default_currency_code:
                current.default_currency_code ||
                suggestions.default_currency_code,
            }
          : {}),
        ...(current.timezone || suggestions.timezone
          ? { timezone: current.timezone || suggestions.timezone }
          : {}),
        ...(resolvedPreview.image_url
          ? { image_url: resolvedPreview.image_url }
          : {}),
        ...(resolvedPreview.brand_palette
          ? { brand_palette: resolvedPreview.brand_palette }
          : {}),
        id,
      }
    } catch (error) {
      if (sequence === selectionSequence) {
        selectionError.value = errorMessage(error)
      }
    } finally {
      if (sequence === selectionSequence) selectionPending.value = false
    }
  }

  function clearSelection() {
    selectionSequence += 1
    draft.value = null
    selectionKind.value = null
    selectionPending.value = false
    selectionError.value = ''
    completion.value = null
    preview.value = null
    imageFile.value = null
    onboarding.reset()
  }

  function setCurrencyCode(value: string) {
    if (!draft.value) return
    draft.value = {
      ...draft.value,
      default_currency_code: text(value).toUpperCase().slice(0, 3),
    }
  }

  function setTimezone(value: string) {
    if (!draft.value) return
    draft.value = { ...draft.value, timezone: text(value) }
  }

  function setImageFile(value: File | null) {
    if (!canEditImage.value) return
    imageFile.value = value
  }

  function setBrandPalette(value: SparseBrandPalette) {
    if (!draft.value || !canEditBrandPalette.value) return
    const next = { ...draft.value }
    if (Object.keys(value).length) next.brand_palette = value
    else delete next.brand_palette
    draft.value = next
    onboarding.invalidateFrom('brand')
  }

  return {
    ...onboarding,
    clearSelection,
    completion,
    brandPalette,
    canAddBrand,
    canConfigure,
    canEditBrandPalette,
    canEditImage,
    currencyCode,
    draft,
    imageFile,
    isExisting,
    needsEnrichment,
    needsDefaults,
    preview,
    selectPlace,
    setCurrencyCode,
    setBrandPalette,
    setImageFile,
    setTimezone,
    selectionError,
    selectionPending,
    timezone,
  }
}
