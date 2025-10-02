<template>
  <div class="space-y-4">
    <div class="text-sm text-gray-600">Search and add kitchen experience</div>
    <div class="flex gap-2">
      <UInput v-model="query" placeholder="Search kitchens, roles..." />
      <UButton @click="onSearch">Search</UButton>
    </div>
    <div v-if="results.length" class="space-y-2">
      <div v-for="(res, i) in results" :key="i" class="flex items-center justify-between p-2 border rounded">
        <div>
          <div class="font-medium">{{ res.title }}</div>
          <div class="text-xs text-gray-500">{{ res.subtitle }}</div>
        </div>
        <UButton size="xs" @click="add(res)">Add</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<(e: 'create', payload: any) => void>()

const query = ref('')
const results = ref<Array<{ title: string; subtitle?: string; payload?: any }>>([])

function onSearch() {
  // Placeholder static mock; integrate real search later
  results.value = query.value
    ? [
        { title: `Result for "${query.value}"`, subtitle: 'Demo item', payload: { title: query.value } },
      ]
    : []
}

function add(res: any) {
  emit('create', res.payload || { title: res.title })
}
</script>
