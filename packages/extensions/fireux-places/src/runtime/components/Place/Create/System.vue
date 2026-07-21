<template>
  <!-- Concurrent edit — 2026-07-21 16:32 CEST — Place onboarding completion: compose defaults, optional brand, and review steps. -->
  <section
    data-onboarding-family="place"
    :data-onboarding-step="activeStepId || undefined"
  >
    <MoleculesCreateCard>
      <template #header>
        <div class="form-stack-sm">
          <UBadge color="neutral" variant="soft">
            Step {{ stepNumber }} of {{ stepCount }}
          </UBadge>
          <div>
            <strong>{{ currentStep?.label }}</strong>
            <p class="form-text-muted">{{ currentStep?.description }}</p>
          </div>
          <UProgress :model-value="progress" :max="100" />
        </div>
      </template>

      <PlaceCreateSearch
        v-show="activeStepId === 'find'"
        :pending="selectionPending"
        :error="selectionError"
        @selected="selectPlace"
        @cleared="clearSelection"
      />

      <PlaceCreateIdentity
        v-if="activeStepId === 'identity' && draft"
        :place="draft"
        :existing="isExisting"
      />

      <PlaceCreateDefaults
        v-if="activeStepId === 'defaults' && draft"
        :currency-code="currencyCode"
        :timezone="timezone"
        :locked="!canConfigure"
        @update:currency-code="setCurrencyCode"
        @update:timezone="setTimezone"
      />

      <PlaceCreateBrand
        v-if="activeStepId === 'brand' && draft"
        :place-name="draft.name"
        :image-url="draft.image_url || ''"
        :image-file="imageFile"
        :uploading="pending"
        @image-selected="setImageFile"
      />

      <PlaceCreateReview
        v-if="activeStepId === 'review' && draft"
        :place="draft"
        :existing="isExisting"
        :configuring="needsEnrichment"
        :currency-code="currencyCode"
        :timezone="timezone"
        :logo-staged="Boolean(imageFile)"
      />

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Unable to continue"
        :description="error"
      />

      <template #footer>
        <UFieldGroup>
          <UButton
            v-if="!isFirstStep"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            :disabled="pending"
            @click="back"
          >
            Back
          </UButton>
          <UButton
            color="primary"
            :icon="isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'"
            :loading="pending"
            :disabled="continueDisabled"
            @click="onContinue"
          >
            {{ continueLabel }}
          </UButton>
        </UFieldGroup>
      </template>
    </MoleculesCreateCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlacesOnboarding,
  type PlaceOnboardingResult,
} from '../../../composables/fireux/place/usePlacesOnboarding'

const emit = defineEmits<{
  (event: 'created', result: PlaceOnboardingResult): void
}>()

const {
  activeStepId,
  back,
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
  setImageFile,
  setTimezone,
  selectionError,
  selectionPending,
  stepCount,
  stepNumber,
  timezone,
} = usePlacesOnboarding()

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
