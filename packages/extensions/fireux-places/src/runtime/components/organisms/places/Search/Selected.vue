<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <div class="flex items-start gap-3">
      <div class="relative flex-shrink-0">
        <UAvatar
          :src="displayAvatar || undefined"
          :alt="place.name"
          size="lg"
          icon="i-lucide-map-pin"
        />
        <div
          v-if="showSpinner"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm dark:bg-gray-950/60"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="h-5 w-5 animate-spin text-gray-400"
          />
        </div>
      </div>

      <div class="flex-1 space-y-1">
        <p class="text-sm font-semibold text-gray-900">{{ place.name }}</p>
        <p class="text-sm text-gray-500">
          {{ place.formatted_address || '—' }}
        </p>
        <div
          v-if="errorMessage"
          class="flex items-center gap-1 text-xs font-medium text-amber-600"
        >
          <UIcon name="i-lucide-alert-triangle" class="h-3.5 w-3.5" />
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <UButton
          v-if="showRetryButton"
          size="sm"
          color="primary"
          variant="ghost"
          :loading="isFetchingLogo"
          :disabled="isFetchingLogo"
          @click="handleRetry()"
        >
          <UIcon
            v-if="!isFetchingLogo"
            name="i-lucide-refresh-ccw"
            class="mr-1 h-4 w-4"
          />
          <UIcon
            v-else
            name="i-lucide-loader-2"
            class="mr-1 h-4 w-4 animate-spin"
          />
          {{ retryLabel }}
        </UButton>

        <div class="ml-auto flex items-center gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            :disabled="isActionDisabled"
            @click="handleClear"
          >
            <UIcon name="i-lucide-x" class="mr-1" /> Clear
          </UButton>
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-check"
            :loading="isSavingSelection"
            :disabled="isActionDisabled"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import type { BasePlace } from '../../../../../models/place.model'
import {
  DEFAULT_LOGO_TIMEOUT_MS,
  sanitizeLogoAvatar,
  usePlaceLogoState,
} from '../../../../composables/usePlaceLogos'

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'confirm', place: BasePlace): void
}>()

const props = defineProps<{
  place: BasePlace
  saving?: boolean
  disabled?: boolean
}>()
const place = computed(() => props.place)

const logoState = usePlaceLogoState(place, {
  timeoutMs: DEFAULT_LOGO_TIMEOUT_MS,
  autoHydrate: true,
  retryOnEmpty: true,
  shouldHydrate: (next, currentAvatar) =>
    next.source === 'google' && !currentAvatar,
  emptyMessage: 'No logo yet. Try again?',
})

const displayAvatar = computed(
  () => logoState.avatar.value ?? sanitizeLogoAvatar(props.place.avatar)
)
const isFetchingLogo = computed(() => logoState.isLoading.value)
const showSpinner = computed(() => isFetchingLogo.value && !displayAvatar.value)
const showRetryButton = computed(
  () =>
    props.place.source === 'google' &&
    logoState.hasAttempted.value &&
    !displayAvatar.value
)
const errorMessage = computed(() => logoState.error.value)
const retryLabel = computed(() =>
  isFetchingLogo.value ? 'Retrying…' : 'Retry logo'
)
const isSavingSelection = computed(() => !!props.saving)
const isDisabledByAuth = computed(() => !!props.disabled)
const isActionDisabled = computed(
  () => isSavingSelection.value || isDisabledByAuth.value
)
const confirmLabel = computed(() => {
  if (isSavingSelection.value) return 'Saving…'
  if (isDisabledByAuth.value) return 'Sign in to save'
  return 'Confirm'
})

async function handleRetry() {
  if (isFetchingLogo.value) return
  await logoState.retry()
}

function handleClear() {
  if (isActionDisabled.value) return
  emit('clear')
}

function handleConfirm() {
  if (isActionDisabled.value) return
  const payload: BasePlace = {
    ...props.place,
    avatar: displayAvatar.value ?? null,
  }
  emit('confirm', payload)
}

onBeforeUnmount(() => {
  logoState.cancel()
})
</script>
