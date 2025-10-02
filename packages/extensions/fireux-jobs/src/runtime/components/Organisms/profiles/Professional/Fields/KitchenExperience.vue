<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="font-medium">{{ title }}</div>
      <div class="text-sm text-gray-500">{{ period }}</div>
    </div>
    <div class="text-sm text-gray-600" v-if="item?.description">
      {{ item.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Lightweight placeholder matching the slot contract used in Edit.vue
// Props reflect the legacy object-array item shape; adjust fields as your data requires
const props = defineProps<{
  kitchenExperience: any
  index?: number
  mode: 'display' | 'edit'
  remove?: () => void
}>()

const item = props.kitchenExperience || {}

const title = computed(() => item?.title || item?.name || 'Experience')
const period = computed(() => {
  const from = item?.from_year || item?.from || ''
  const to = item?.to_year || item?.to || 'Present'
  return [from, to].filter(Boolean).join(' – ')
})
</script>
