<template>
  <WorkspaceKitchenOnboarding
    v-if="derived.outcome === 'empty' && derived.canCreate"
  />
  <WorkspaceKitchenSelector
    v-if="derived.outcome === 'ready' && state.kitchens.length > 1"
    :kitchens="state.kitchens"
    :selected-kitchen-id="state.kitchen.id"
    :primary-kitchen-id="state.primaryKitchenId"
    :can-select-multiple="derived.canSelectMultiple"
  />
</template>

<script setup lang="ts">
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
}>()
</script>
