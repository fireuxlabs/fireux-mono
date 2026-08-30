<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Kitchen controls"
  >
    <WorkspaceKitchenSelector
      v-if="state.kitchen.id || derived.canSelectMultiple"
      :kitchen="state.kitchen"
      :kitchen-ids="state.user.kitchens"
      :can-select-multiple="derived.canSelectMultiple"
      :has-multiple-kitchens="state.user.kitchens.length > 1"
      :refresh="refresh"
    />
    <WorkspaceKitchenCreate v-if="derived.canCreate" />
  </section>
</template>

<script setup lang="ts">
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  refresh: () => Promise<unknown>
}>()
</script>
