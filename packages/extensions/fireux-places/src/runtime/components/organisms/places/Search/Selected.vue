<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <template #header>
      <span class="text-sm font-medium text-gray-700">Selected place</span>
    </template>

    <div class="flex items-start gap-3">
      <UAvatar
        :src="place.avatar || undefined"
        :alt="place.name"
        size="lg"
        icon="i-lucide-map-pin"
      />

      <div class="flex-1 space-y-1">
        <p class="text-sm font-semibold text-gray-900">{{ place.name }}</p>
        <p class="text-sm text-gray-500">
          {{ place.formatted_address || '—' }}
        </p>
      </div>
    </div>

    <div
      v-if="logoErrorMessage"
      class="rounded-md border border-orange-200 bg-orange-50 p-3"
    >
      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm font-medium text-orange-800">
          {{ logoErrorMessage }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            size="xs"
            color="warning"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="isLoadingLogo"
            @click="handleRetry"
          >
            Try again
          </UButton>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center gap-2">
        <p
          v-if="isLoadingLogo"
          class="flex items-center gap-1 text-xs font-medium text-gray-500"
        >
          <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
          fetching logo
        </p>

        <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            @click="handleClear"
          >
            <UIcon name="i-lucide-x" class="mr-1" /> Clear
          </UButton>
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-check"
            :loading="isLoadingLogo"
            @click="handleConfirm"
          >
            Confirm
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { Place } from '../../../../../models/place.model'

interface SearchSelectedProps {
  place: Place
  isLoadingLogo?: boolean
  logoErrorMessage?: string | null
}

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'confirm', place: Place): void
  (event: 'retry'): void
}>()

const props = defineProps<SearchSelectedProps>()
const place = toRef(props, 'place')
const isLoadingLogo = toRef(props, 'isLoadingLogo')
const logoErrorMessage = toRef(props, 'logoErrorMessage')

function handleClear() {
  emit('clear')
}

function handleConfirm() {
  emit('confirm', place.value)
}

function handleRetry() {
  emit('retry')
}
</script>
