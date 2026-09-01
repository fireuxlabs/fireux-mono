<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Kitchen selector"
  >
    <template v-if="derived.status === 'loading'">
      <USkeleton class="h-8 w-36 rounded-md" />
    </template>
    <WorkspaceKitchenSelectorChoices
      v-else-if="state.kitchen.id || state.appUser.kitchens.length"
      :kitchen="state.kitchen"
      :kitchen-ids="state.appUser.kitchens"
      :can-select-multiple="state.appUser.kitchens.length > 1"
      :has-multiple-kitchens="state.appUser.kitchens.length > 1"
      :refresh="refresh"
    />
    <UButton
      v-if="derived.create.allowed"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Kitchen"
      @click="createOpen = true"
    />

    <WorkspaceKitchenCrudCreate v-model:open="createOpen" :refresh="refresh" />
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
