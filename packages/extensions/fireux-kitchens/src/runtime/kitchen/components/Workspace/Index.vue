<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen"
  >
    <WorkspaceCrud
      label="Kitchen"
      :available="derived.capability.availableActions"
    >
      <template #create="{ open, setOpen }">
        <WorkspaceKitchenCrudCreate :open="open" @update:open="setOpen" />
      </template>
      <template #read="{ open, setOpen }">
        <WorkspaceKitchenCrudRead
          :open="open"
          :state="state"
          @update:open="setOpen"
        />
      </template>
      <template #update="{ open, setOpen }">
        <WorkspaceKitchenCrudUpdate
          :open="open"
          :state="state"
          :update="primitives.update"
          @update:open="setOpen"
        />
      </template>
    </WorkspaceCrud>
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
import WorkspaceKitchenCrudCreate from './Crud/Create.vue'
import WorkspaceKitchenCrudRead from './Crud/Read.vue'
import WorkspaceKitchenCrudUpdate from './Crud/Update.vue'
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
}>()
</script>
