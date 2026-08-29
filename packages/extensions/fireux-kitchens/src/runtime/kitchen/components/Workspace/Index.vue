<template>
  <!-- Show the selected Kitchen when its Workspace presentation is complete. -->
  <WorkspaceKitchenActive :kitchen="state.kitchen" />
  <!-- Show the onboarding entry when no complete Kitchen is active. -->
  <WorkspaceKitchenOnboarding />
  <!-- Show the Kitchens this user can select and the doorway for adding another when allowed. -->
  <WorkspaceKitchenSelector />
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
