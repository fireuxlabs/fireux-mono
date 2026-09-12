import {
  useOnboarding,
  type OnboardingStep,
} from 'fireux-core/runtime/composables/shared/useOnboarding'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useKitchenWorkspaceIndex } from './workspace/index/useKitchenWorkspaceIndex'
import type {
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPlace,
  KitchenOnboardingPreview,
} from '../models/kitchen-onboarding.model.ts'
import { useKitchenCreate } from './firestore/useKitchenCreate'

export type KitchenOnboardingStepId = 'review'

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

export function useKitchenOnboarding(options: {
  selectWorkspace: () => boolean
  returnTo: () => string
  onCreated: (result: KitchenOnboardingCompleteResult) => void
  onError: (message: string) => void
}) {
  const place = ref<KitchenOnboardingPlace | null>(null)
  const preview = ref<KitchenOnboardingPreview | null>(null)
  const selectionPending = ref(false)
  const selectionError = ref('')
  const completion = ref<KitchenOnboardingCompleteResult | null>(null)
  let selectionSequence = 0
  const { completeKitchenOnboarding, previewKitchenOnboarding } =
    useKitchenCreate()

  function validateReview() {
    if (selectionPending.value) return 'Wait while we confirm this Kitchen.'
    if (selectionError.value) return selectionError.value
    if (!place.value || !preview.value)
      return 'Find your kitchen before continuing.'
    if (!preview.value.can_complete) {
      return preview.value.message || 'Kitchen access is required.'
    }
    return true
  }

  const steps = computed<readonly OnboardingStep<KitchenOnboardingStepId>[]>(
    () => [
      {
        id: 'review',
        label: 'Review Kitchen',
        description: 'Confirm your kitchen and access.',
        icon: 'i-lucide-list-checks',
        validate: validateReview,
      },
    ]
  )

  async function finish() {
    const currentPlace = place.value
    const currentPreview = preview.value
    if (!currentPlace || !currentPreview) {
      throw new Error('Find your kitchen before continuing.')
    }

    try {
      const result = await completeKitchenOnboarding({
        place_id: currentPreview.place_id,
        ...(currentPreview.owner_user_id
          ? { owner_user_id: currentPreview.owner_user_id }
          : {}),
        ...(currentPreview.existing
          ? { kitchen_id: currentPreview.kitchen_id }
          : {}),
      })
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
    initialStepId: 'review',
    onFinish: finish,
  })

  async function loadSelection(input: {
    place_id?: string
    kitchen_id?: string
    owner_user_id?: string
  }) {
    const sequence = ++selectionSequence
    onboarding.reset()
    completion.value = null
    selectionError.value = ''
    selectionPending.value = true
    place.value = null
    preview.value = null

    try {
      const resolvedPreview = await previewKitchenOnboarding(input)
      if (sequence !== selectionSequence) return false
      if (!resolvedPreview?.place_id || !resolvedPreview.kitchen_id) {
        throw new Error('Kitchen onboarding preview was invalid.')
      }

      if (
        !resolvedPreview.place ||
        resolvedPreview.place.id !== resolvedPreview.place_id
      ) {
        throw new Error('The kitchen location is unavailable.')
      }

      preview.value = resolvedPreview
      place.value = resolvedPreview.place
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

  const selectPlace = (placeId: string, ownerUserId = '') => {
    const id = text(placeId)
    if (!id) return Promise.resolve(false)
    return loadSelection({
      place_id: id,
      ...(text(ownerUserId) ? { owner_user_id: text(ownerUserId) } : {}),
    })
  }

  const selectKitchen = (kitchenId: string, ownerUserId = '') => {
    const id = text(kitchenId)
    if (!id) return Promise.resolve(false)
    return loadSelection({
      kitchen_id: id,
      ...(text(ownerUserId) ? { owner_user_id: text(ownerUserId) } : {}),
    })
  }

  function clearSelection() {
    selectionSequence += 1
    place.value = null
    preview.value = null
    selectionPending.value = false
    selectionError.value = ''
    completion.value = null
    onboarding.reset()
  }

  const workspace = useKitchenWorkspaceIndex()
  const app = useAppSession()
  const route = useRoute()
  const router = useRouter()
  const finishing = ref(false)

  async function finishSelection(result: KitchenOnboardingCompleteResult) {
    if (finishing.value) return
    finishing.value = true
    try {
      if (options.selectWorkspace() && result.owner_user_id === app.uid.value) {
        if (
          !workspace.collection.value.some(
            (kitchen) => kitchen.id === result.kitchen_id
          )
        ) {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              stop()
              reject(
                new Error(
                  'Your kitchen was added. It is still loading; try opening it again.'
                )
              )
            }, 15000)
            const stop = watch(
              workspace.collection,
              (kitchens: Array<{ id?: string }>) => {
                if (
                  !kitchens.some((kitchen) => kitchen.id === result.kitchen_id)
                )
                  return
                clearTimeout(timer)
                stop()
                resolve()
              }
            )
          })
        }
        workspace.select(result.kitchen_id)
      }
      options.onCreated(result)
      if (route.path !== options.returnTo())
        await router.push(options.returnTo())
    } catch (cause) {
      options.onError(
        cause instanceof Error ? cause.message : 'Unable to open your kitchen.'
      )
    } finally {
      finishing.value = false
    }
  }

  return {
    ...onboarding,
    finishSelection,
    finishing,
    clearSelection,
    completion,
    place,
    preview,
    selectKitchen,
    selectPlace,
    selectionError,
    selectionPending,
  }
}
