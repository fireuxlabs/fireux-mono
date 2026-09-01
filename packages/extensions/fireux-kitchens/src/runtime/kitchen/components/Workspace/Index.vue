<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen"
  >
    <WorkspaceKitchenCrud
      :state="state"
      :derived="derived"
      :refresh="refresh"
    />
    <UAlert
      v-if="derived.outcome !== 'pending' && !derived.hasSelection"
      color="neutral"
      variant="subtle"
      icon="i-lucide-cooking-pot"
      title="No Kitchen selected"
      description="Create or select a Kitchen to begin this Workspace."
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
