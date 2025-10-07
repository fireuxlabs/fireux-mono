<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-gray-500">Saved places</h2>
        <UBadge color="neutral" size="xs">{{ items.length }}</UBadge>
      </div>

      <ul v-if="items.length" class="space-y-2">
        <li
          v-for="place in items"
          :key="place.place_id"
          class="rounded border border-gray-100 px-3 py-2"
        >
          <div class="font-medium">{{ place.name }}</div>
          <div class="text-xs text-gray-500">
            {{ place.formatted_address || '—' }}
          </div>
          <div class="text-[11px] text-gray-400">ID: {{ place.place_id }}</div>
        </li>
      </ul>

      <p v-else class="text-sm text-gray-500">
        No saved places yet. Add a Firestore doc in <code>places</code> to see
        it here.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../../composables/usePlaces'

const { collection } = usePlaces()

const items = computed(() => collection.value ?? [])
</script>
