<template>
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: compose one Place stage at a time through the shared shell. -->
  <MoleculesOnboardingSystem
    family="place"
    :step-id="activeStepId"
    :title="currentStep?.label || 'Add a Place'"
    :step-number="stepNumber"
    :step-count="stepCount"
    :progress="progress"
    :error="error"
    :pending="pending"
    :show-back="!isFirstStep"
    :continue-label="continueLabel"
    :continue-icon="isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'"
    :continue-disabled="continueDisabled"
    @back="back"
    @continue="onContinue"
  >
      <PlaceOnboardingFind
        v-show="activeStepId === 'find'"
        :pending="selectionPending"
        :error="selectionError"
        @selected="selectPlace"
        @cleared="clearSelection"
      />

      <PlaceOnboardingDefaults
        v-if="activeStepId === 'defaults' && draft"
        :currency-code="currencyCode"
        :timezone="timezone"
        :locked="!canConfigure"
        @update:currency-code="setCurrencyCode"
        @update:timezone="setTimezone"
      />

      <PlaceOnboardingBrand
        v-if="activeStepId === 'brand' && draft"
        :place-name="draft.name"
        :image-url="draft.image_url || ''"
        :image-file="imageFile"
        :uploading="pending"
        :image-editable="canEditImage"
        :brand-palette="brandPalette"
        :palette-editable="canEditBrandPalette"
        @image-selected="setImageFile"
        @update:brand-palette="setBrandPalette"
      />

      <PlaceOnboardingReview
        v-if="activeStepId === 'review' && draft"
        :place="draft"
        :currency-code="currencyCode"
        :timezone="timezone"
        :logo-staged="Boolean(imageFile)"
        :brand-palette="brandPalette"
      />
  </MoleculesOnboardingSystem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlaceOnboarding,
  type PlaceOnboardingResult,
} from '../../composables/fireux/place/usePlaceOnboarding'

const emit = defineEmits<{
  (event: 'created', result: PlaceOnboardingResult): void
}>()

const {
  activeStepId,
  back,
  brandPalette,
  canEditBrandPalette,
  canEditImage,
  clearSelection,
  completion,
  canConfigure,
  currentStep,
  currencyCode,
  draft,
  error,
  finished,
  isExisting,
  isFirstStep,
  isLastStep,
  imageFile,
  needsEnrichment,
  next,
  pending,
  progress,
  selectPlace,
  setCurrencyCode,
  setBrandPalette,
  setImageFile,
  setTimezone,
  selectionError,
  selectionPending,
  stepCount,
  stepNumber,
  timezone,
} = usePlaceOnboarding()

const continueDisabled = computed(() =>
  pending.value ||
  finished.value ||
  selectionPending.value ||
  (activeStepId.value === 'find' && !draft.value)
)

const continueLabel = computed(() => {
  if (!isLastStep.value) return 'Continue'
  if (isExisting.value && needsEnrichment.value) return 'Finish Place'
  return isExisting.value ? 'Use Place' : 'Add Place'
})

async function onContinue() {
  const advanced = await next()
  if (advanced && completion.value) emit('created', completion.value)
}
</script>
