<template>
  <!-- Show loading or the selected Kitchen. -->
  <WorkspaceKitchenActive
    v-if="derived.outcome === 'pending' || derived.hasSelection"
    :kitchen="state.kitchen"
  />
  <!-- Start onboarding when there are no Kitchens and creation is allowed. -->
  <WorkspaceKitchenOnboarding
    v-if="derived.outcome === 'empty' && derived.canCreate"
  />
  <!-- Show the available Kitchens when Kitchen data is ready. -->
  <WorkspaceKitchenSelector v-if="derived.outcome === 'ready'" />
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
