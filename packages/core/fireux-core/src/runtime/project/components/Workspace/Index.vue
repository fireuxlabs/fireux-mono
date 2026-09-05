<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Project"
  >
    <WorkspaceCrud
      label="Project"
      :available="creation.canCreate.value ? ['create', 'read'] : ['read']"
    >
      <template #create="{ open, setOpen }">
        <WorkspaceProjectCrudCreate :open="open" @update:open="setOpen" />
      </template>
      <template #read="{ open, setOpen }">
        <WorkspaceProjectCrudRead :open="open" @update:open="setOpen" />
      </template>
    </WorkspaceCrud>
    <p v-if="workspace.outcome.value === 'pending'" role="status">
      Loading selected Project…
    </p>
    <UAlert
      v-else-if="workspace.outcome.value === 'error'"
      color="error"
      title="Project could not be loaded"
    />
    <UAlert
      v-else-if="workspace.outcome.value === 'missing'"
      color="warning"
      title="Selected Project does not exist"
    />
  </section>
</template>

<script setup lang="ts">
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import WorkspaceProjectCrudCreate from './Crud/Create.vue'
import WorkspaceProjectCrudRead from './Crud/Read.vue'
import { useProjectWorkspace } from '../../composables/workspace/core/useProjectWorkspace'

const creation = useWorkspaceCreation('project')
const workspace = useProjectWorkspace()
</script>
