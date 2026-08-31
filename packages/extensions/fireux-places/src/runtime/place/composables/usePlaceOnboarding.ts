// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: confirm local defaults and stage optional branding before trusted completion.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: stage sparse brand colours without copying inherited defaults.
// Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: expose the singular Place domain adapter over usePlaceCreate.
import { useOnboarding } from 'fireux-core/runtime/composables/shared/useOnboarding'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import { parseBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import { computed, ref } from 'vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from './firestore/fetch/google/usePlacesGoogle'
import { usePlaceCreate } from './firestore/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from '../models/place-onboarding.model.ts'
import type { PlaceOnboardingPreview } from '../models/place-onboarding.model.ts'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../utils/place-spine'
import {
  enrichPlaceDraft,
  hasPhysicalPlaceLocation,
  placeOnboardingErrorMessage,
  placeOnboardingSteps,
  placeOnboardingText as text,
  type PlaceOnboardingResult,
  type PlaceOnboardingSelection,
  type PlaceOnboardingStepId,
} from '../utils/place-onboarding'
import { completePlaceDraft } from '../utils/place-onboarding-completion'

export type { PlaceOnboardingResult, PlaceOnboardingSelection }

export type { PlaceOnboardingStepId }

export function usePlaceOnboarding() {
  const draft = ref<PlaceUpsertInput | null>(null)
  const selectionKind = ref<'provider' | 'existing' | null>(null)
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<PlaceOnboardingResult | null>(null)
  const preview = ref<PlaceOnboardingPreview | null>(null)
  const imageFile = ref<File | null>(null)
  const coverFile = ref<File | null>(null)
  let selectionSequence = 0
  const {
    completePlaceOnboarding,
    enrichPlaceOnboarding,
    ensurePlaceExists,
    previewPlaceOnboarding,
  } = usePlaceCreate()
  const { uploadImage } = useImageStorage()

  const isExisting = computed(() => selectionKind.value === 'existing')
  const canConfigure = computed(() => preview.value?.can_configure === true)
  const needsDefaults = computed(() =>
    Boolean(
      preview.value && canConfigure.value && preview.value.requires_defaults
    )
  )
  const canAddBrand = computed(() =>
    Boolean(
      preview.value &&
        canConfigure.value &&
        (!preview.value.image_url || !preview.value.brand_palette)
    )
  )
  const needsIdentity = computed(() =>
    Boolean(
      canConfigure.value &&
        (!text(draft.value?.short_name) || !text(draft.value?.tagline))
    )
  )
  const needsDiscovery = computed(() =>
    Boolean(
      canConfigure.value &&
        (!text(draft.value?.about) ||
          !draft.value?.tags?.length ||
          !text(draft.value?.cover_image))
    )
  )
  const needsEnrichment = computed(() =>
    Boolean(
      needsDefaults.value ||
        needsIdentity.value ||
        needsDiscovery.value ||
        canAddBrand.value
    )
  )
  const canEditImage = computed(() =>
    Boolean(canAddBrand.value && !preview.value?.image_url)
  )
  const canEditCover = computed(() =>
    Boolean(canConfigure.value && !preview.value?.cover_image)
  )
  const canEditBrandPalette = computed(() =>
    Boolean(canAddBrand.value && !preview.value?.brand_palette)
  )
  const brandPalette = computed<SparseBrandPalette>(
    () => draft.value?.brand_palette || {}
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
    if (!isExisting.value && !hasPhysicalPlaceLocation(draft.value)) {
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

  const steps = computed(() =>
    placeOnboardingSteps({
      needsDefaults: needsDefaults.value,
      needsIdentity: needsIdentity.value,
      needsDiscovery: needsDiscovery.value,
      canAddBrand: canAddBrand.value,
      validateFind,
      validateDefaults,
      validateIdentity: () =>
        text(draft.value?.short_name)
          ? true
          : 'Confirm a short name for this Place.',
      validateDiscovery: () =>
        text(draft.value?.about)
          ? true
          : 'Confirm a short factual introduction for this Place.',
      validateBrand,
      validateReview: () => {
        const selection = validateSelection()
        if (selection !== true) return selection
        const defaults = validateDefaults()
        return defaults === true ? validateBrand() : defaults
      },
    })
  )

  async function finish() {
    completion.value = await completePlaceDraft({
      draft: draft.value,
      needsEnrichment: needsEnrichment.value,
      currencyCode: validatedCurrencyCode.value,
      timezone: validatedTimezone.value,
      brandPalette: brandPalette.value,
      imageFile: imageFile.value,
      coverFile: coverFile.value,
      ensurePlaceExists,
      completePlaceOnboarding,
      uploadImage,
    })
    return true
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
    coverFile.value = null

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
        ...(resolvedPreview.logo_image
          ? { logo_image: resolvedPreview.logo_image }
          : {}),
        ...(resolvedPreview.short_name
          ? { short_name: resolvedPreview.short_name }
          : {}),
        ...(resolvedPreview.tagline
          ? { tagline: resolvedPreview.tagline }
          : {}),
        ...(resolvedPreview.about ? { about: resolvedPreview.about } : {}),
        ...(resolvedPreview.tags?.length ? { tags: resolvedPreview.tags } : {}),
        ...(resolvedPreview.cover_image
          ? { cover_image: resolvedPreview.cover_image }
          : {}),
        ...(resolvedPreview.brand_palette
          ? { brand_palette: resolvedPreview.brand_palette }
          : {}),
        id,
      }

      if (canConfigure.value) {
        const enriched = await enrichPlaceDraft(
          draft.value,
          id,
          enrichPlaceOnboarding
        )
        if (sequence !== selectionSequence) return
        draft.value = enriched
      }
    } catch (error) {
      if (sequence === selectionSequence) {
        selectionError.value = placeOnboardingErrorMessage(error)
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
    coverFile.value = null
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

  function setShortName(value: string) {
    if (!draft.value || !canConfigure.value) return
    draft.value = { ...draft.value, short_name: value.slice(0, 80) }
  }

  function setTagline(value: string) {
    if (!draft.value || !canConfigure.value) return
    draft.value = { ...draft.value, tagline: value.slice(0, 180) }
  }

  function setAbout(value: string) {
    if (!draft.value || !canConfigure.value) return
    draft.value = { ...draft.value, about: value.slice(0, 900) }
  }

  function setTags(value: string[]) {
    if (!draft.value || !canConfigure.value) return
    draft.value = {
      ...draft.value,
      tags: Array.from(
        new Set(value.map((tag) => text(tag).toLowerCase()).filter(Boolean))
      ).slice(0, 8),
    }
  }

  function setImageFile(value: File | null) {
    if (!canEditImage.value) return
    imageFile.value = value
  }

  function setCoverFile(value: File | null) {
    if (!canEditCover.value) return
    coverFile.value = value
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
    canEditCover,
    currencyCode,
    draft,
    imageFile,
    coverFile,
    isExisting,
    needsEnrichment,
    needsIdentity,
    needsDiscovery,
    needsDefaults,
    preview,
    selectPlace,
    setCurrencyCode,
    setBrandPalette,
    setImageFile,
    setCoverFile,
    setTimezone,
    setShortName,
    setTagline,
    setAbout,
    setTags,
    selectionError,
    selectionPending,
    timezone,
  }
}
