// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: compose Place selection with Kitchen-only identity and atomic activation.
import { useOnboarding, type OnboardingStep } from 'fireux-core/runtime/composables/shared/useOnboarding'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  PublicPlaceDetailProjection,
  PublicPlaceDetailResponse,
} from 'fireux-places/runtime/models/place-public.model'
import { computed, ref } from 'vue'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../models/kitchen-onboarding.model'

export type KitchenOnboardingStepId = 'identity' | 'review'

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
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<KitchenOnboardingCompleteResult | null>(null)
  let selectionSequence = 0

  const canEditIdentity = computed(() => preview.value?.existing !== true)
  const effectiveName = computed(() =>
    displayName.value || text(place.value?.name) || 'Kitchen'
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

  const steps = computed<readonly OnboardingStep<KitchenOnboardingStepId>[]>(
    () => [
      {
        id: 'identity',
        label: 'Kitchen identity',
        description: 'Use the Place identity or add one Kitchen-specific name.',
        icon: 'i-lucide-chef-hat',
        validate: validateIdentity,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Confirm the Kitchen, inherited Place defaults, and console access.',
        icon: 'i-lucide-list-checks',
        validate: validateIdentity,
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

  return {
    ...onboarding,
    canEditIdentity,
    clearSelection,
    completion,
    displayName,
    effectiveName,
    place,
    preview,
    selectKitchen,
    selectPlace,
    selectionError,
    selectionPending,
    setDisplayName,
  }
}
