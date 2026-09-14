<template>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-semibold">Kitchens</h2>
    <UButton
      v-if="canCreate"
      label="Add Kitchen"
      icon="i-lucide-plus"
      @click="emit('create')"
    />
  </header>
  <p v-if="index.outcome.value === 'pending'" role="status">
    Loading Kitchens…
  </p>
  <UAlert
    v-else-if="index.outcome.value === 'error'"
    color="error"
    title="Kitchens could not be loaded"
  />
  <div
    v-else-if="index.collection.value.length"
    class="grid min-w-0 grid-cols-1 gap-2"
  >
    <UButton
      v-for="kitchen in index.collection.value"
      :key="kitchen.id"
      color="neutral"
      :variant="kitchen.id === index.selectedId.value ? 'soft' : 'ghost'"
      class="min-w-0 max-w-full justify-start"
      :aria-pressed="kitchen.id === index.selectedId.value"
      @click="select(kitchen.id || '')"
    >
      <UAvatar
        :src="kitchen.display_image_url || undefined"
        :alt="kitchen.display_name"
        icon="i-lucide-chef-hat"
      />
      <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
    </UButton>
  </div>
  <p v-else class="text-sm text-muted">
    {{
      canCreate ? 'Create a Kitchen to get started.' : 'No Kitchens to show.'
    }}
  </p>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  index: ReturnType<typeof useKitchenWorkspaceIndex>
  canCreate: boolean
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
function select(id: string) {
  props.index.select(id)
  if (props.openOnSelect) void navigateTo('/')
}
</script>
