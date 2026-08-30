<template>
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: keep Kitchen selection and stages in one named domain funnel. -->
  <section
    data-onboarding-family="kitchen"
    :data-onboarding-step="activeStepId || undefined"
  >
    <MoleculesStateCard
      v-if="initialSelectionPending || selectionPending"
      entity="kitchen"
      kind="document"
      surface="bare"
      loading
    />

    <div v-else-if="!place && existingRootId" class="form-stack-sm">
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Unable to connect Kitchen"
        :description="selectionError || 'This Kitchen could not be prepared.'"
      />
      <UButton
        :to="resolvedCancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Back to Kitchens
      </UButton>
    </div>

    <div v-else-if="!place" class="form-stack">
      <PlaceOnboarding @created="onPlaceReady" />

      <UButton
        v-if="resolvedCancelTo"
        :to="resolvedCancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>

      <UAlert
        v-if="selectionError"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Unable to prepare Kitchen"
        :description="selectionError"
      />
    </div>

    <OnboardingShell v-else-if="preview" family="kitchen" :stage="shellStage">
      <template #intro>
        <span
          class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-cooking-pot" class="size-6" />
        </span>
        <p class="mt-6 text-sm font-semibold text-primary">Kitchen setup</p>
        <h1
          class="mt-2 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
        >
          Add a Kitchen
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted">
          Choose the Place this Kitchen belongs to and review access before
          creation.
        </p>
      </template>

      <div v-if="!preview.can_complete" class="form-stack-sm">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-lock-keyhole"
          title="Kitchen access required"
          :description="
            preview.message ||
            'Ask an App admin or Kitchen operator for access.'
          "
        />
        <UButton
          v-if="existingKitchenTo"
          :to="existingKitchenTo"
          color="neutral"
          variant="soft"
          icon="i-lucide-store"
        >
          View Kitchen
        </UButton>
      </div>

      <KitchenOnboardingReview
        v-if="activeStepId === 'review'"
        :place="place"
        :preview="preview"
      />

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            :disabled="pending"
            @click="onBack"
          >
            {{ backLabel }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            :icon="isLastStep ? completionIcon : 'i-lucide-arrow-right'"
            :loading="pending"
            :disabled="continueDisabled"
            @click="onContinue"
          >
            {{ continueLabel }}
          </UButton>
        </div>
      </template>
    </OnboardingShell>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import type { FireuxEntityCreateMode } from 'fireux-core/runtime/models/utils/entity-create.model'
import type { PlaceOnboardingResult } from 'fireux-places/runtime/place/composables/usePlaceOnboarding'
import { computed, onMounted, ref, watch } from 'vue'
import { useKitchenWorkspaceSelection } from '../composables/workspace/core/useKitchenWorkspaceSelection'
import { useKitchenOnboarding } from '../composables/useKitchenOnboarding'
import type { KitchenOnboardingCompleteResult } from '../models/kitchen-onboarding.model.ts'

const props = withDefaults(
  defineProps<{
    mode?: FireuxEntityCreateMode
    existingRootId?: string
    placeId?: string
    returnTo?: string
    cancelTo?: string
    ownerUserId?: string
    selectWorkspaceOnComplete?: boolean
  }>(),
  {
    mode: 'workspace',
    existingRootId: '',
    placeId: '',
    returnTo: '',
    cancelTo: '',
    ownerUserId: '',
    selectWorkspaceOnComplete: true,
  }
)

const emit = defineEmits<{
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

const route = useRoute()
const router = useRouter()
const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()
const {
  activeStepId,
  back,
  clearSelection,
  completion,
  currentStep,
  error,
  isFirstStep,
  isLastStep,
  next,
  pending,
  place,
  preview,
  progress,
  selectKitchen,
  selectPlace,
  selectionError,
  selectionPending,
  stepCount,
  stepNumber,
} = useKitchenOnboarding()

const shellStage = computed(() => ({
  id: activeStepId.value,
  title: currentStep.value?.label || 'Add a Kitchen',
  number: stepNumber.value,
  count: stepCount.value,
  progress: progress.value,
  error: error.value,
}))

const initialLoaded = ref(false)
const existingRootId = computed(() =>
  String(props.existingRootId || route.query.existingRootId || '').trim()
)
const initialPlaceId = computed(() =>
  existingRootId.value
    ? ''
    : String(props.placeId || route.query.placeId || '').trim()
)
const hasInitialSelection = computed(() =>
  Boolean(existingRootId.value || initialPlaceId.value)
)
const initialSelectionPending = computed(
  () =>
    hasInitialSelection.value && !initialLoaded.value && !selectionError.value
)
const canChangePlace = computed(() => !existingRootId.value)
const resolvedCancelTo = computed(() => {
  const explicit = String(props.cancelTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return props.mode === 'workspace' ? '/' : '/kitchens'
})
const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue
  return '/workspace/kitchen/identity'
})
const existingKitchenTo = computed(() => {
  if (!preview.value?.existing) return ''
  const locator = String(preview.value.slug || preview.value.kitchen_id).trim()
  return locator ? `/kitchens/${encodeURIComponent(locator)}` : ''
})
const continueDisabled = computed(
  () => pending.value || selectionPending.value || !preview.value?.can_complete
)
const continueLabel = computed(() => {
  if (!isLastStep.value) return 'Continue'
  if (preview.value?.action === 'connect') return 'Connect Kitchen'
  if (preview.value?.action === 'open') {
    const name = String(preview.value.display_name || '').trim()
    return name ? `Open ${name}` : 'Open Kitchen'
  }
  return 'Create Kitchen'
})
const completionIcon = computed(() => {
  if (preview.value?.action === 'connect') return 'i-lucide-plug-zap'
  if (preview.value?.action === 'open') return 'i-lucide-arrow-right'
  return 'i-lucide-check'
})
const backLabel = computed(() => {
  if (!isFirstStep.value) return 'Back'
  return canChangePlace.value ? 'Change Place' : 'Back to Kitchens'
})

async function onPlaceReady(result: PlaceOnboardingResult) {
  await selectPlace(result.id, props.ownerUserId)
}

async function onBack() {
  if (!isFirstStep.value) {
    back()
    return
  }
  if (canChangePlace.value) {
    clearSelection()
    return
  }
  await router.push(resolvedCancelTo.value)
}

async function onContinue() {
  const advanced = await next()
  if (!advanced || !completion.value) return
  if (props.selectWorkspaceOnComplete) {
    setKitchenWorkspaceSelection({ kitchenId: completion.value.kitchen_id })
  }
  emit('created', completion.value)
  if (route.path !== resolvedReturnTo.value) {
    await router.push(resolvedReturnTo.value)
  }
}

async function loadRouteSelection() {
  if (existingRootId.value) {
    await selectKitchen(existingRootId.value, props.ownerUserId)
  } else if (initialPlaceId.value) {
    await selectPlace(initialPlaceId.value, props.ownerUserId)
  } else {
    clearSelection()
  }
}

const mounted = ref(false)

onMounted(async () => {
  mounted.value = true
  await loadRouteSelection()
  initialLoaded.value = true
})

watch(
  [existingRootId, initialPlaceId],
  async (
    [kitchenId, placeId]: [string, string],
    [previousKitchenId, previousPlaceId]: [string, string]
  ) => {
    if (!mounted.value) return
    if (kitchenId === previousKitchenId && placeId === previousPlaceId) return
    initialLoaded.value = false
    await loadRouteSelection()
    initialLoaded.value = true
  }
)
</script>
