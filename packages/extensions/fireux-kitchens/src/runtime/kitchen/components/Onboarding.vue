<template>
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: keep Kitchen selection and stages in one named domain funnel. -->
  <section
    data-onboarding-family="kitchen"
    :data-onboarding-step="activeStepId || undefined"
  >
    <KitchenOnboardingContribution
      v-if="directoryResult"
      :result="directoryResult"
      :pending="selectionPending"
      :error="selectionError"
      @associate="associateContribution"
      @back="directoryResult = null; associating = false; clearSelection()"
    />
    <MoleculesStateCard
      v-else-if="initialSelectionPending || selectionPending"
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
      <KitchenOnboardingFind
        :owner-user-id="ownerUserId"
        :directory="isDirectory"
        :resolve-existing="resolveExistingKitchen"
        @created="onPlaceReady"
        @shell-created="finishSelection"
        @contributed="directoryResult = $event"
      />

      <UButton
        v-if="resolvedCancelTo && resolvedCancelTo !== route.path"
        :to="resolvedCancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>

      <UAlert
        v-if="selectionError || error"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Unable to prepare Kitchen"
        :description="selectionError || error"
      />
    </div>

    <OnboardingShell v-else-if="preview" family="kitchen" :stage="shellStage">
      <template #intro>
        <h1
          class="mt-2 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
        >
          Add a kitchen
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{
            isDirectory
              ? 'Review this directory listing.'
              : 'Review your kitchen and available access.'
          }}
        </p>
      </template>

      <div v-if="!isDirectory && !preview.can_complete" class="form-stack-sm">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-lock-keyhole"
          title="Kitchen access required"
          :description="preview.message || 'Ask an administrator for access.'"
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

      <slot name="selected" :preview="preview" :place="place" />

      <KitchenOnboardingReview
        v-if="activeStepId === 'review'"
        :place="place"
        :preview="preview"
      />

      <template #footer>
        <div
          class="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            :disabled="pending"
            class="w-full justify-center sm:w-auto"
            @click="onBack"
          >
            {{ backLabel }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            :icon="isLastStep ? completionIcon : 'i-lucide-arrow-right'"
            :loading="pending || finishing"
            :disabled="continueDisabled"
            class="w-full justify-center sm:w-auto"
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
import { useKitchenOnboarding } from '../composables/useKitchenOnboarding'
import { useKitchenCreate } from '../composables/firestore/useKitchenCreate'
import type {
  KitchenDirectoryContributionResult,
  KitchenOnboardingCompleteResult,
} from '../models/kitchen-onboarding.model.ts'

const props = withDefaults(
  defineProps<{
    intent?: 'workspace' | 'directory'
    mode?: FireuxEntityCreateMode
    existingRootId?: string
    placeId?: string
    returnTo?: string
    cancelTo?: string
    ownerUserId?: string
    selectWorkspaceOnComplete?: boolean
  }>(),
  {
    intent: 'workspace',
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
const directoryResult = ref<KitchenDirectoryContributionResult | null>(null)
const associating = ref(false)
const isDirectory = computed(
  () => props.intent === 'directory' && !associating.value
)
const { previewKitchenOnboarding, contributeKitchenDirectory } =
  useKitchenCreate()
const {
  activeStepId,
  finishSelection,
  finishing,
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
} = useKitchenOnboarding({
  selectWorkspace: () => props.selectWorkspaceOnComplete,
  returnTo: () => resolvedReturnTo.value,
  onCreated: (result) => emit('created', result),
  onError: (message) => {
    error.value = message
  },
})

const shellStage = computed(() => ({
  id: activeStepId.value,
  title: currentStep.value?.label || 'Add a kitchen',
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
  return '/'
})

const existingKitchenTo = computed(() => {
  if (!preview.value?.existing) return ''
  const locator = String(preview.value.slug || preview.value.kitchen_id).trim()
  return locator ? `/kitchens/${encodeURIComponent(locator)}` : ''
})
const continueDisabled = computed(
  () =>
    pending.value ||
    finishing.value ||
    selectionPending.value ||
    (!isDirectory.value && !preview.value?.can_complete)
)
const continueLabel = computed(() => {
  if (isDirectory.value)
    return preview.value?.existing ? 'View kitchen' : 'Add to directory'
  if (!isLastStep.value) return 'Continue'
  if (preview.value?.action === 'connect') return 'Add to My Kitchens'
  if (preview.value?.action === 'open') {
    return 'Open kitchen'
  }
  return 'Add kitchen'
})
const completionIcon = computed(() => {
  if (preview.value?.action === 'connect') return 'i-lucide-plug-zap'
  if (preview.value?.action === 'open') return 'i-lucide-arrow-right'
  return 'i-lucide-check'
})
const backLabel = computed(() => {
  if (!isFirstStep.value) return 'Back'
  return canChangePlace.value ? 'Back to search' : 'Back to Kitchens'
})

async function onPlaceReady(result: PlaceOnboardingResult) {
  await selectPlace(result.id, props.ownerUserId)
}

async function resolveExistingKitchen(placeId: string) {
  try {
    const result = await previewKitchenOnboarding({
      place_id: placeId,
      ...(props.ownerUserId ? { owner_user_id: props.ownerUserId } : {}),
    })
    if (
      !result.existing &&
      (isDirectory.value || result.can_complete) &&
      (!result.place.default_currency_code || !result.place.timezone)
    )
      return false
    await selectPlace(result.place_id, props.ownerUserId)
    return true
  } catch {
    selectionError.value = 'Unable to check this kitchen. Please try again.'
    return true
  }
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
  if (isDirectory.value && preview.value) {
    pending.value = true
    try {
      directoryResult.value = preview.value.existing
        ? {
            ok: true,
            kitchen_id: preview.value.kitchen_id,
            created_root: false,
            slug: preview.value.slug,
          }
        : await contributeKitchenDirectory({ place_id: preview.value.place_id })
    } catch {
      error.value =
        'Unable to add this kitchen to the directory. Please try again.'
    } finally {
      pending.value = false
    }
    return
  }
  if (completion.value) {
    await finishSelection(completion.value)
    return
  }
  const advanced = await next()
  if (!advanced || !completion.value) return
  await finishSelection(completion.value)
}

async function associateContribution() {
  const result = directoryResult.value
  if (!result) return
  if (selectionPending.value) return
  associating.value = true
  const resolved = await selectKitchen(result.kitchen_id)
  if (directoryResult.value !== result) return
  if (resolved) directoryResult.value = null
  else associating.value = false
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
