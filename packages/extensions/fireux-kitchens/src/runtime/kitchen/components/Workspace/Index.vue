<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen"
  >
    <WorkspaceKitchenCrud
      :state="state"
      :derived="derived"
      :primitives="primitives"
      :natives="natives"
    />
    <UAlert
      v-if="derived.status !== 'loading' && !state.kitchen.id"
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
  useKitchenWorkspaceIndex,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

type Workspace = ReturnType<typeof useKitchenWorkspaceIndex>

defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  primitives: Workspace['primitives']
  natives: Workspace['natives']
}>()
</script>
