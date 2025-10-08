<template>
  <UCard>
    <div class="flex items-start gap-3">
      <img
        v-if="place.avatar"
        :src="place.avatar"
        :alt="`${place.name} avatar`"
        class="h-12 w-12 flex-shrink-0 rounded object-cover"
      />

      <div class="flex-1 space-y-1">
        <div class="font-medium text-gray-900">{{ place.name }}</div>
        <div class="text-xs text-gray-500">
          {{ place.formatted_address || '—' }}
        </div>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <UButton size="xs" color="neutral" variant="ghost" @click="handleClear">
        <UIcon name="i-lucide-x" class="mr-1" /> Clear
      </UButton>
      <UButton size="xs" color="primary" @click="handleConfirm">
        <UIcon name="i-lucide-check" class="mr-1" /> Confirm
      </UButton>
    </div>
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
