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

    <div
      v-else-if="!place && existingRootId"
      class="form-stack-sm"
    >
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

    <MoleculesOnboardingSystem
      v-else-if="preview"
      family="kitchen"
      :step-id="activeStepId"
      :title="currentStep?.label || 'Add a Kitchen'"
      :step-number="stepNumber"
      :step-count="stepCount"
      :progress="progress"
      :error="error"
      :pending="pending"
      :show-back="!isFirstStep || canChangePlace || !preview.can_complete"
      :back-label="backLabel"
      :continue-label="continueLabel"
      :continue-icon="isLastStep ? completionIcon : 'i-lucide-arrow-right'"
      :continue-disabled="continueDisabled"
      @back="onBack"
      @continue="onContinue"
    >

      <div v-if="!preview.can_complete" class="form-stack-sm">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-lock-keyhole"
          title="Kitchen access required"
          :description="preview.message || 'Ask an App admin or Kitchen operator for access.'"
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

      <KitchenOnboardingIdentity
        v-if="activeStepId === 'identity'"
        :place="place"
        :display-name="displayName"
        :editable="canEditIdentity"
        @update:display-name="setDisplayName"
      />

      <KitchenOnboardingReview
        v-if="activeStepId === 'review'"
        :place="place"
        :preview="preview"
        :effective-name="effectiveName"
        :palette-override="paletteOverride"
        :inherited-palette="inheritedPalette"
      />

      <KitchenOnboardingBrand
        v-if="activeStepId === 'brand'"
        :model-value="paletteOverride"
        :inherited="inheritedPalette"
        :editable="canEditPalette"
        @update:model-value="setPaletteOverride"
      />

    </MoleculesOnboardingSystem>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import type { ConsoleCreateMode } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import type { PlaceOnboardingResult } from 'fireux-places/runtime/composables/fireux/place/usePlaceOnboarding'
import { computed, onMounted, ref, watch } from 'vue'
import { useKitchenConsoleSelection } from '../../composables/fireux/console/kitchen/core/useKitchenConsoleSelection'
import { useKitchenOnboarding } from '../../composables/fireux/kitchen/useKitchenOnboarding'
import type { KitchenOnboardingCompleteResult } from '../../models/kitchen-onboarding.model'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  existingRootId?: string
  placeId?: string
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  existingRootId: '',
  placeId: '',
  returnTo: '',
  cancelTo: '',
})

const emit = defineEmits<{
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

const route = useRoute()
const router = useRouter()
const { setKitchenConsoleSelection } = useKitchenConsoleSelection()
const {
  activeStepId,
  back,
  canEditIdentity,
  canEditPalette,
  clearSelection,
  completion,
  currentStep,
  displayName,
  effectiveName,
  error,
  isFirstStep,
  isLastStep,
  inheritedPalette,
  next,
  pending,
  place,
  paletteOverride,
  preview,
  progress,
  selectKitchen,
  selectPlace,
  selectionError,
  selectionPending,
  setDisplayName,
  setPaletteOverride,
  stepCount,
  stepNumber,
} = useKitchenOnboarding()

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
const initialSelectionPending = computed(() =>
  hasInitialSelection.value &&
  !initialLoaded.value &&
  !selectionError.value
)
const canChangePlace = computed(() => !existingRootId.value)
const resolvedCancelTo = computed(() => {
  const explicit = String(props.cancelTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return props.mode === 'console' ? '/console/kitchen' : '/kitchens'
})
const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue
  return '/console/kitchen/identity'
})
const existingKitchenTo = computed(() => {
  if (!preview.value?.existing) return ''
  const locator = String(
    preview.value.slug || preview.value.kitchen_id
  ).trim()
  return locator ? `/kitchens/${encodeURIComponent(locator)}` : ''
})
const continueDisabled = computed(() =>
  pending.value ||
  selectionPending.value ||
  !preview.value?.can_complete
)
const continueLabel = computed(() => {
  if (!isLastStep.value) return 'Continue'
  if (preview.value?.action === 'connect') return 'Connect Kitchen'
  if (preview.value?.action === 'open') return 'Open Kitchen'
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
  await selectPlace(result.id)
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
  setKitchenConsoleSelection({ kitchenId: completion.value.kitchen_id })
  emit('created', completion.value)
  if (route.path !== resolvedReturnTo.value) {
    await router.push(resolvedReturnTo.value)
  }
}

async function loadRouteSelection() {
  if (existingRootId.value) {
    await selectKitchen(existingRootId.value)
  } else if (initialPlaceId.value) {
    await selectPlace(initialPlaceId.value)
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
  async ([kitchenId, placeId], [previousKitchenId, previousPlaceId]) => {
    if (!mounted.value) return
    if (kitchenId === previousKitchenId && placeId === previousPlaceId) return
    initialLoaded.value = false
    await loadRouteSelection()
    initialLoaded.value = true
  }
)
</script>
