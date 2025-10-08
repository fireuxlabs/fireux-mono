<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Selected place</span>
        <UBadge color="primary" variant="soft" size="xs">Ready to save</UBadge>
      </div>
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

    <template #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <UButton size="sm" color="neutral" variant="ghost" @click="handleClear">
          <UIcon name="i-lucide-x" class="mr-1" /> Clear
        </UButton>
        <UButton
          size="sm"
          color="primary"
          icon="i-lucide-check"
          @click="handleConfirm"
        >
          Confirm
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { Place } from '../../../../../models/place.model'

interface SearchSelectedProps {
  place: Place
}

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'confirm', place: Place): void
}>()

const props = defineProps<SearchSelectedProps>()
const place = toRef(props, 'place')

function handleClear() {
  emit('clear')
}

function handleConfirm() {
  emit('confirm', place.value)
}
</script>
