<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-3' }">
    <div class="flex items-start gap-3">
      <UAvatar
        :src="place.avatar || undefined"
        :alt="place.name"
        size="lg"
        icon="i-lucide-map-pin"
      />
      <div class="flex-1 min-w-0">
        <p class="truncate text-sm font-semibold text-gray-900">
          {{ place.name }}
        </p>
        <p class="truncate text-sm text-gray-500">
          {{ place.formatted_address || '—' }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UButton
          size="sm"
          color="neutral"
          variant="soft"
          :disabled="isBusy"
          @click="emit('clear')"
        >
          <UIcon name="i-lucide-x" class="mr-1 h-4 w-4" /> Clear
        </UButton>
        <UButton
          size="sm"
          color="primary"
          variant="soft"
          icon="i-lucide-check"
          :loading="!!confirming"
          :disabled="isBusy"
          @click="emit('confirm', place)"
        >
          {{ confirming ? 'Saving…' : 'Confirm' }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BasePlace } from 'fireux-places/runtime/models/place.model'

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'confirm', place: BasePlace): void
}>()

const props = defineProps<{
  place: BasePlace
  confirming?: boolean
  disabled?: boolean
}>()

const isBusy = computed(() => !!props.confirming || !!props.disabled)
</script>
