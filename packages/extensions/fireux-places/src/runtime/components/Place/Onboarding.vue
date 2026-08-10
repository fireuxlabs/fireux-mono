<template>
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: compose one Place stage at a time through the shared shell. -->
  <!-- Concurrent edit — 2026-07-22 15:59 CEST — Place onboarding logo preview: pass staged image state into the final review. -->
  <MoleculesOnboardingSystem family="place" :stage="shellStage">
    <template #intro>
      <span
        class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <UIcon name="i-lucide-map-pin" class="size-6" />
      </span>
      <p class="mt-6 text-sm font-semibold text-primary">Place setup</p>
      <h1
        class="mt-2 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
      >
        Add a Place
      </h1>
      <p class="mt-3 text-sm leading-6 text-muted">
        Search for an existing location or enter a new Place manually.
      </p>
    </template>

    <PlaceOnboardingChoose v-if="!entryMethod" @choose="entryMethod = $event" />

    <template v-else-if="entryMethod === 'search'">
      <UButton
        v-if="activeStepId === 'find'"
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-4"
        @click="resetEntryMethod"
      >
        Change method
      </UButton>
      <PlaceOnboardingFind
        v-show="activeStepId === 'find'"
        :pending="selectionPending"
        :error="selectionError"
        @selected="selectPlace"
        @cleared="clearSelection"
        @manual="openManualEntry"
      />
    </template>

    <PlaceOnboardingManual
      v-else
      :require-defaults="requireDefaults"
      @back="resetEntryMethod"
      @created="emit('created', $event)"
    />

    <PlaceOnboardingDefaults
      v-if="entryMethod === 'search' && activeStepId === 'defaults' && draft"
      :currency-code="currencyCode"
      :timezone="timezone"
      :locked="!canConfigure"
      @update:currency-code="setCurrencyCode"
      @update:timezone="setTimezone"
    />

    <PlaceOnboardingBrand
      v-if="entryMethod === 'search' && activeStepId === 'brand' && draft"
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
      v-if="entryMethod === 'search' && activeStepId === 'review' && draft"
      :place="draft"
      :currency-code="currencyCode"
      :timezone="timezone"
      :image-file="imageFile"
      :brand-palette="brandPalette"
    />

    <template v-if="entryMethod === 'search'" #footer>
      <div
        class="flex items-center gap-3"
        :class="isFirstStep ? 'justify-end' : 'justify-between'"
      >
        <UButton
          v-if="!isFirstStep"
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
          :disabled="pending"
          @click="onBack"
        >
          Back
        </UButton>
        <UButton
          type="button"
          color="primary"
          :icon="isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'"
          :loading="pending"
          :disabled="continueDisabled"
          @click="onContinue"
        >
          {{ continueLabel }}
        </UButton>
      </div>
    </template>
  </MoleculesOnboardingSystem>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  usePlaceOnboarding,
  type PlaceOnboardingResult,
} from '../../composables/fireux/place/usePlaceOnboarding'

const props = withDefaults(defineProps<{
  requireDefaults?: boolean
}>(), {
  requireDefaults: false,
})

const requireDefaults = computed(() => props.requireDefaults === true)

const emit = defineEmits<{
  (event: 'created', result: PlaceOnboardingResult): void
}>()

const entryMethod = ref<'search' | 'manual' | null>(null)

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

function onBack(): void {
  back()
}

function resetEntryMethod(): void {
  clearSelection()
  entryMethod.value = null
}

function openManualEntry(): void {
  clearSelection()
  entryMethod.value = 'manual'
}

const shellStage = computed(() => ({
  id: entryMethod.value ? activeStepId.value : 'method',
  title: entryMethod.value
    ? currentStep.value?.label || 'Add a Place'
    : 'Choose a method',
  number: entryMethod.value ? stepNumber.value : 1,
  count: entryMethod.value ? stepCount.value : 1,
  progress: entryMethod.value ? progress.value : 100,
  error: error.value,
}))

const continueDisabled = computed(
  () =>
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
