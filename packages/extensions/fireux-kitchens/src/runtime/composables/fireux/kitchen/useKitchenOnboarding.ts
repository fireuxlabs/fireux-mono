// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: compose Place selection with Kitchen-only identity and atomic activation.
// Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: stage only colours overriding the linked Place.
import { useOnboarding, type OnboardingStep } from 'fireux-core/runtime/composables/shared/useOnboarding'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  PublicPlaceDetailProjection,
  PublicPlaceDetailResponse,
} from 'fireux-places/runtime/models/place-public.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import { parseBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import { computed, ref } from 'vue'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../models/kitchen-onboarding.model'

export type KitchenOnboardingStepId = 'identity' | 'palette' | 'review'

const text = (value: unknown) => String(value ?? '').trim()

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
  return 'Unable to prepare this Kitchen right now.'
}

export function useKitchenOnboarding() {
  const place = ref<PublicPlaceDetailProjection | null>(null)
  const preview = ref<KitchenOnboardingPreview | null>(null)
  const displayName = ref('')
  const paletteOverride = ref<SparseBrandPalette>({})
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<KitchenOnboardingCompleteResult | null>(null)
  let selectionSequence = 0

  const canEditIdentity = computed(() => preview.value?.existing !== true)
  const effectiveName = computed(() =>
    displayName.value || text(place.value?.name) || 'Kitchen'
  )
  const canEditPalette = computed(() => preview.value?.existing === false)
  const inheritedPalette = computed<SparseBrandPalette>(() =>
    place.value?.brand_palette || {}
  )

  async function authHeaders() {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  function validateIdentity() {
    if (selectionPending.value) return 'Wait while we confirm this Kitchen.'
    if (selectionError.value) return selectionError.value
    if (!place.value || !preview.value) return 'Choose a Place before continuing.'
    if (!preview.value.can_complete) {
      return preview.value.message || 'Kitchen access is required.'
    }
    if (displayName.value.length > 120) return 'Kitchen name is too long.'
    return true
  }

  function validatePalette() {
    const result = parseBrandPalette(paletteOverride.value)
    return 'error' in result ? result.error : true
  }

  const steps = computed<readonly OnboardingStep<KitchenOnboardingStepId>[]>(
    () => [
      {
        id: 'identity',
        label: 'Kitchen identity',
        description: 'Use the Place identity or add one Kitchen-specific name.',
        icon: 'i-lucide-chef-hat',
        validate: validateIdentity,
      },
      ...(canEditPalette.value
        ? [{
            id: 'palette' as const,
            label: 'Kitchen colours',
            description: 'Use the Place colours or add a sparse Kitchen override.',
            icon: 'i-lucide-palette',
            validate: validatePalette,
          }]
        : []),
      {
        id: 'review',
        label: 'Review',
        description: 'Confirm the Kitchen, inherited Place defaults, and console access.',
        icon: 'i-lucide-list-checks',
        validate: () => {
          const identity = validateIdentity()
          return identity === true ? validatePalette() : identity
        },
      },
    ]
  )

  async function finish() {
    const currentPlace = place.value
    const currentPreview = preview.value
    if (!currentPlace || !currentPreview) {
      throw new Error('Choose a Place before continuing.')
    }

    try {
      const result = await $fetch<KitchenOnboardingCompleteResult>(
        '/api/kitchens/onboarding/complete',
        {
          method: 'POST',
          headers: await authHeaders(),
          body: {
            place_id: currentPreview.place_id,
            ...(currentPreview.existing
              ? { kitchen_id: currentPreview.kitchen_id }
              : {}),
            ...(canEditIdentity.value && displayName.value
              ? { display_name: displayName.value }
              : {}),
            ...(canEditPalette.value && Object.keys(paletteOverride.value).length
              ? { palette_override: paletteOverride.value }
              : {}),
          },
        }
      )
      if (
        result?.ok !== true ||
        result.kitchen_id !== currentPreview.kitchen_id ||
        result.place_id !== currentPreview.place_id
      ) {
        throw new Error('Kitchen onboarding completion was invalid.')
      }
      completion.value = result
      return true
    } catch (error) {
      throw new Error(errorMessage(error))
    }
  }

  const onboarding = useOnboarding<KitchenOnboardingStepId>({
    steps,
    initialStepId: 'identity',
    onFinish: finish,
  })

  async function loadSelection(input: {
    place_id?: string
    kitchen_id?: string
  }) {
    const sequence = ++selectionSequence
    onboarding.reset()
    completion.value = null
    selectionError.value = ''
    selectionPending.value = true
    place.value = null
    preview.value = null
    displayName.value = ''
    paletteOverride.value = {}

    try {
      const resolvedPreview = await $fetch<KitchenOnboardingPreview>(
        '/api/kitchens/onboarding/preview',
        {
          method: 'POST',
          headers: await authHeaders(),
          body: input,
        }
      )
      if (sequence !== selectionSequence) return false
      if (!resolvedPreview?.place_id || !resolvedPreview.kitchen_id) {
        throw new Error('Kitchen onboarding preview was invalid.')
      }

      const response = await $fetch<PublicPlaceDetailResponse>(
        `/api/places/${encodeURIComponent(resolvedPreview.place_id)}`
      )
      if (sequence !== selectionSequence) return false
      if (!response?.item || response.item.id !== resolvedPreview.place_id) {
        throw new Error('The linked Place is unavailable.')
      }

      preview.value = resolvedPreview
      place.value = response.item
      displayName.value = resolvedPreview.existing
        ? text(resolvedPreview.display_name)
        : ''
      paletteOverride.value = resolvedPreview.palette_override || {}
      return true
    } catch (error) {
      if (sequence === selectionSequence) {
        selectionError.value = errorMessage(error)
      }
      return false
    } finally {
      if (sequence === selectionSequence) selectionPending.value = false
    }
  }

  const selectPlace = (placeId: string) => {
    const id = text(placeId)
    if (!id) return Promise.resolve(false)
    return loadSelection({ place_id: id })
  }

  const selectKitchen = (kitchenId: string) => {
    const id = text(kitchenId)
    if (!id) return Promise.resolve(false)
    return loadSelection({ kitchen_id: id })
  }

  function clearSelection() {
    selectionSequence += 1
    place.value = null
    preview.value = null
    displayName.value = ''
    paletteOverride.value = {}
    selectionPending.value = false
    selectionError.value = ''
    completion.value = null
    onboarding.reset()
  }

  function setDisplayName(value: string) {
    if (!canEditIdentity.value) return
    displayName.value = text(value).slice(0, 120)
    onboarding.invalidateFrom('identity')
  }

  function setPaletteOverride(value: SparseBrandPalette) {
    if (!canEditPalette.value) return
    paletteOverride.value = value
    onboarding.invalidateFrom('palette')
  }

  return {
    ...onboarding,
    canEditIdentity,
    canEditPalette,
    clearSelection,
    completion,
    displayName,
    effectiveName,
    inheritedPalette,
    place,
    paletteOverride,
    preview,
    selectKitchen,
    selectPlace,
    selectionError,
    selectionPending,
    setDisplayName,
    setPaletteOverride,
  }
}
