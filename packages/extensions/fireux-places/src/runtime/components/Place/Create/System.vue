<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: orchestrate Place-owned steps over shared mechanics. -->
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

      <PlaceCreateReview
        v-if="activeStepId === 'review' && draft"
        :place="draft"
        :existing="isExisting"
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
  currentStep,
  draft,
  error,
  finished,
  isExisting,
  isFirstStep,
  isLastStep,
  next,
  pending,
  progress,
  selectPlace,
  selectionError,
  selectionPending,
  stepCount,
  stepNumber,
} = usePlacesOnboarding()

const continueDisabled = computed(() =>
  pending.value ||
  finished.value ||
  selectionPending.value ||
  (activeStepId.value === 'find' && !draft.value)
)

const continueLabel = computed(() => {
  if (!isLastStep.value) return 'Continue'
  return isExisting.value ? 'Use Place' : 'Add Place'
})

async function onContinue() {
  const advanced = await next()
  if (advanced && completion.value) emit('created', completion.value)
}
</script>
