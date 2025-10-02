<template>
  <div class="space-y-2">
    <!-- Display Mode -->
    <div v-if="mode === 'display'" class="space-y-1">
      <div class="font-medium">{{ item.name || '—' }}</div>
      <div class="text-sm text-gray-500">
        {{ item.role || '—' }}
      </div>
      <div class="text-xs text-gray-500">
        {{ item.from_month }} {{ item.from_year }} —
        {{ item.ongoing ? 'Present' : [item.to_month, item.to_year].filter(Boolean).join(' ') || '—' }}
      </div>
      <div class="text-gray-700 whitespace-pre-line">
        {{ item.responsibilities }}
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="space-y-2">
      <UInput v-model="local.name" placeholder="Name / Organization" />
      <UInput v-model="local.role" placeholder="Role / Position" />
      <div class="grid grid-cols-2 gap-2">
        <UInput v-model="local.from_month" placeholder="From month" />
        <UInput v-model="local.from_year" placeholder="From year" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <UInput v-model="local.to_month" placeholder="To month" :disabled="local.ongoing" />
        <UInput v-model="local.to_year" placeholder="To year" :disabled="local.ongoing" />
      </div>
      <UCheckbox v-model="local.ongoing" label="Ongoing" />
      <UTextarea v-model="local.responsibilities" :rows="4" placeholder="Responsibilities…" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  item: any
  index: number
  mode: 'display' | 'edit'
  remove?: () => void
}>()

const local = reactive<any>({ ...(props.item || {}) })

watch(
  () => props.item,
  (n) => Object.assign(local, n || {}),
  { deep: true }
)
</script>
