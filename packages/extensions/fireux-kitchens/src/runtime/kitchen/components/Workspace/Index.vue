<template>
  <section class="flex items-center gap-2" aria-label="Kitchen controls">
    <WorkspaceKitchenSelector
      v-if="state.kitchens.length"
      :kitchens="state.kitchens"
      :selected-entity-id="state.kitchen.id"
      :primary-kitchen-id="state.user.primaryKitchen"
      :can-select-multiple="derived.canSelectMultiple"
      :refresh="refresh"
    />
    <WorkspaceKitchenCreate
      v-if="derived.canCreate"
      compact
      label="Create Kitchen"
    />
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
