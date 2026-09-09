<template>
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: compose one Place stage at a time through the shared shell. -->
  <!-- Concurrent edit — 2026-07-22 15:59 CEST — Place onboarding logo preview: pass staged image state into the final review. -->
  <OnboardingShell family="place" :stage="shellStage">
    <template #intro>
      <slot name="intro">
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
          Find the location, confirm its defaults, and review the Place before
          it is added.
        </p>
      </slot>
    </template>

    <PlaceOnboardingFind
      v-show="activeStepId === 'find'"
      :pending="selectionPending"
      :error="
        requiredOnly
          ? selectionError.replace(/Place/g, 'location')
          : selectionError
      "
      @selected="selectPlace"
      @cleared="clearSelection"
    />

    <slot v-if="activeStepId === 'find'" name="find-secondary" />

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
      :image-url="draft.image_url || draft.logo_image || ''"
      :image-file="imageFile"
      :uploading="pending"
      :image-editable="canEditImage"
      :brand-palette="brandPalette"
      :palette-editable="canEditBrandPalette"
      @image-selected="setImageFile"
      @update:brand-palette="setBrandPalette"
    />

    <PlaceOnboardingIdentity
      v-if="activeStepId === 'identity' && draft"
      :short-name="draft.short_name || ''"
      :tagline="draft.tagline || ''"
      @update:short-name="setShortName"
      @update:tagline="setTagline"
    />

    <PlaceOnboardingDiscovery
      v-if="activeStepId === 'discovery' && draft"
      :place-name="draft.name"
      :about="draft.about || ''"
      :tags="draft.tags || []"
      :cover-image="draft.cover_image || ''"
      :cover-file="coverFile"
      :cover-editable="canEditCover"
      :uploading="pending"
      @update:about="setAbout"
      @update:tags="setTags"
      @cover-selected="setCoverFile"
    />

    <PlaceOnboardingReview
      v-if="activeStepId === 'review' && draft"
      :place="draft"
      :currency-code="currencyCode"
      :timezone="timezone"
      :image-file="imageFile"
      :cover-file="coverFile"
      :brand-palette="brandPalette"
    />

    <template #footer>
      <div
        class="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center"
        :class="isFirstStep ? 'sm:justify-end' : 'sm:justify-between'"
      >
        <UButton
          v-if="!isFirstStep"
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
          :disabled="pending"
          class="w-full justify-center sm:w-auto"
          @click="onBack"
        >
          Back
        </UButton>
        <UButton
          type="button"
          color="primary"
          :icon="isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'"
          :loading="pending || resolvingExisting"
          :disabled="continueDisabled"
          class="w-full justify-center sm:w-auto"
          @click="onContinue"
        >
          {{ continueLabel }}
        </UButton>
      </div>
    </template>
  </OnboardingShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  usePlaceOnboarding,
  type PlaceOnboardingResult,
} from '../composables/usePlaceOnboarding'

const emit = defineEmits<{
  (event: 'created', result: PlaceOnboardingResult): void
}>()

const props = defineProps<{
  requiredOnly?: boolean
  resolveExisting?: (placeId: string) => Promise<boolean>
}>()
const resolvingExisting = ref(false)

const {
  activeStepId,
  back,
  brandPalette,
  canEditBrandPalette,
  canEditImage,
  canEditCover,
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
  coverFile,
  needsEnrichment,
  next,
  pending,
  progress,
  selectPlace,
  setCurrencyCode,
  setBrandPalette,
  setImageFile,
  setCoverFile,
  setTimezone,
  setShortName,
  setTagline,
  setAbout,
  setTags,
  selectionError,
  selectionPending,
  stepCount,
  stepNumber,
  timezone,
} = usePlaceOnboarding({ requiredOnly: props.requiredOnly })

function onBack(): void {
  back()
}

const shellStage = computed(() => ({
  id: activeStepId.value,
  title: props.requiredOnly
    ? activeStepId.value === 'find'
      ? 'Find your kitchen'
      : 'Currency and timezone'
    : currentStep.value?.label || 'Add a Place',
  number: stepNumber.value,
  count: stepCount.value,
  progress: progress.value,
  error: props.requiredOnly
    ? error.value.replace(/Place/g, 'location')
    : error.value,
}))

const continueDisabled = computed(
  () =>
    pending.value ||
    resolvingExisting.value ||
    finished.value ||
    selectionPending.value ||
    (activeStepId.value === 'find' && !draft.value)
)

const continueLabel = computed(() => {
  if (props.requiredOnly || !isLastStep.value) return 'Continue'
  if (isExisting.value && needsEnrichment.value) return 'Finish Place'
  return isExisting.value ? 'Use Place' : 'Add Place'
})

async function onContinue() {
  if (
    activeStepId.value === 'find' &&
    draft.value?.id &&
    props.resolveExisting
  ) {
    if (resolvingExisting.value) return
    resolvingExisting.value = true
    try {
      if (await props.resolveExisting(String(draft.value.id))) return
    } finally {
      resolvingExisting.value = false
    }
  }
  const advanced = await next()
  if (advanced && completion.value) emit('created', completion.value)
}
</script>
