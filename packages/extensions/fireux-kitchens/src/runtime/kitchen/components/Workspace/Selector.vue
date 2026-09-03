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
      :refresh="natives.refresh"
    />
    <UButton
      v-if="derived.capability.primitives.create.available"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Kitchen"
      @click="createOpen = true"
    />

    <WorkspaceKitchenCrudCreate
      v-model:open="createOpen"
      :refresh="natives.refresh"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
  useKitchenWorkspaceIndex,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

type Workspace = ReturnType<typeof useKitchenWorkspaceIndex>

defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  natives: Workspace['natives']
}>()

const createOpen = ref(false)
</script>
