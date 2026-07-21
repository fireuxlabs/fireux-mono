// Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: layer Place selection and verified ensure over shared step mechanics.
import { useOnboarding, type OnboardingStep } from 'fireux-core/runtime/composables/shared/useOnboarding'
import { computed, ref } from 'vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../firestore/place/fetch/google/usePlacesGoogle'
import { usePlaceCreate } from '../firestore/place/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from '../../../models/place.model'

export type PlaceOnboardingStepId = 'find' | 'identity' | 'review'

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

export function usePlacesOnboarding() {
  const draft = ref<PlaceUpsertInput | null>(null)
  const selectionKind = ref<'provider' | 'existing' | null>(null)
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<PlaceOnboardingResult | null>(null)
  let selectionSequence = 0
  const { ensurePlaceExists } = usePlaceCreate()

  const isExisting = computed(() => selectionKind.value === 'existing')

  function validateFind() {
    if (selectionPending.value) return 'Wait while we confirm this Place.'
    if (selectionError.value) return selectionError.value
    if (!draft.value) return 'Choose a Place before continuing.'
    return true
  }

  function validateIdentity() {
    if (!draft.value || !text(draft.value.name)) {
      return 'Place name is required.'
    }
    if (!isExisting.value && !hasPhysicalLocation(draft.value)) {
      return 'Choose a physical Place with a confirmed location.'
    }
    return true
  }

  const steps: readonly OnboardingStep<PlaceOnboardingStepId>[] = [
    {
      id: 'find',
      label: 'Find the Place',
      description: 'Search the shared Place directory and Google Places.',
      icon: 'i-lucide-search',
      validate: validateFind,
    },
    {
      id: 'identity',
      label: 'Confirm identity',
      description: 'Check the provider-owned name and physical location.',
      icon: 'i-lucide-map-pin',
      validate: validateIdentity,
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Review the shared Place before adding or reusing it.',
      icon: 'i-lucide-check-circle-2',
      validate: validateIdentity,
    },
  ]

  async function finish() {
    const id = canonicalPlaceId(draft.value?.id)
    if (!id) throw new Error('Choose a Place before continuing.')

    try {
      const ensured = await ensurePlaceExists({ id })
      if (!ensured) throw new Error('The Place could not be confirmed.')
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
      if (!providerSelection) {
        draft.value = { ...selection.place, id }
        return
      }

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
    onboarding.reset()
  }

  return {
    ...onboarding,
    clearSelection,
    completion,
    draft,
    isExisting,
    selectPlace,
    selectionError,
    selectionPending,
  }
}
