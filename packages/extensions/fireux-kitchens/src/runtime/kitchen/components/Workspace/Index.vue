<template>
  <section class="workspace-surface workspace-surface--compact" aria-label="Kitchen">
    <WorkspaceKitchenCrud :state="state" :derived="derived" />
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
