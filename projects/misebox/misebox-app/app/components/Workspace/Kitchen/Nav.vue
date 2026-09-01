<template>
  <LayoutsWorkspaceNavbar title="Kitchen Workspace">
    <template
      v-if="derived.status === 'loading' || state.kitchen.id"
      #title
    >
      <WorkspaceKitchenActive :kitchen="state.kitchen" />
    </template>
    <template #right>
      <WorkspaceKitchenInfo />
    </template>
  </LayoutsWorkspaceNavbar>
</template>

<script setup lang="ts">
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  state: Pick<KitchenWorkspaceIndexState, 'kitchen'>
  derived: Pick<KitchenWorkspaceIndexDerived, 'status'>
}>()
</script>
