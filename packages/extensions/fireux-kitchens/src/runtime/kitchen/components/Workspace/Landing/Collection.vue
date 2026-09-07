<template>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-semibold">Kitchens</h2>
    <UButton
      label="Create Kitchen"
      icon="i-lucide-plus"
      :disabled="!canCreate"
      @click="createOpen = true"
    />
    <WorkspaceKitchenCrudCreate v-model:open="createOpen" />
  </header>
  <p v-if="index.outcome.value === 'pending'" role="status">
    Loading Kitchens…
  </p>
  <UAlert
    v-else-if="index.outcome.value === 'error'"
    color="error"
    title="Kitchens could not be loaded"
  />
  <div v-else-if="index.collection.value.length" class="grid gap-2">
    <UButton
      v-for="kitchen in index.collection.value"
      :key="kitchen.id"
      color="neutral"
      :variant="kitchen.id === index.selectedId.value ? 'soft' : 'ghost'"
      class="justify-start"
      :aria-pressed="kitchen.id === index.selectedId.value"
      @click="index.select(kitchen.id || '')"
    >
      <UAvatar
        :src="kitchen.display_image_url || undefined"
        :alt="kitchen.display_name"
        icon="i-lucide-chef-hat"
      />
      <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
    </UButton>
  </div>
  <p v-else class="text-sm text-muted">Create a Kitchen to get started.</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import WorkspaceKitchenCrudCreate from '../Crud/Create.vue'

defineProps<{
  index: ReturnType<typeof useKitchenWorkspaceIndex>
  canCreate: boolean
}>()
const createOpen = ref(false)
</script>
