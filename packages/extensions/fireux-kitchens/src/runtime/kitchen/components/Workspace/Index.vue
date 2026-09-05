<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen"
  >
    <WorkspaceCrud
      label="Kitchen"
      :available="workspace.id.value ? ['create', 'read', 'update'] : ['create', 'read']"
    >
      <template #create="{ open, setOpen }">
        <WorkspaceKitchenCrudCreate :open="open" @update:open="setOpen" />
      </template>
      <template #read="{ open, setOpen }">
        <WorkspaceKitchenCrudRead
          :open="open"
          @update:open="setOpen"
        />
      </template>
      <template #update="{ open, setOpen }">
        <WorkspaceKitchenCrudUpdate
          :open="open"
          @update:open="setOpen"
        />
      </template>
    </WorkspaceCrud>
    <p v-if="workspace.outcome.value === 'pending'" role="status">Loading selected Kitchen…</p>
    <UAlert v-else-if="workspace.outcome.value === 'error'" color="error" title="Kitchen could not be loaded" />
    <UAlert v-else-if="workspace.outcome.value === 'missing'" color="warning" title="Selected Kitchen does not exist" />
    <UAlert
      v-else-if="!workspace.id.value"
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
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'

const workspace = useKitchenWorkspace()
</script>
