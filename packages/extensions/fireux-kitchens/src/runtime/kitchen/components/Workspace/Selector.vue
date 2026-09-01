<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Kitchen selector"
  >
    <template v-if="derived.outcome === 'pending'">
      <USkeleton class="h-8 w-36 rounded-md" />
    </template>
    <WorkspaceKitchenSelectorChoices
      v-else-if="state.kitchen.id || derived.canSelectMultiple"
      :kitchen="state.kitchen"
      :kitchen-ids="state.user.kitchens"
      :can-select-multiple="derived.canSelectMultiple"
      :has-multiple-kitchens="state.user.kitchens.length > 1"
      :refresh="refresh"
    />
    <UButton
      v-if="derived.canSelectMultiple && derived.canCreate"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Kitchen"
      @click="createOpen = true"
    />

    <WorkspaceKitchenCreateModal v-model:open="createOpen" :refresh="refresh" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  refresh: () => Promise<unknown>
}>()

const createOpen = ref(false)
</script>
