<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Project"
  >
    <WorkspaceCrud
      label="Project"
      :available="derived.capability.availableActions"
    >
      <template #create="{ open, setOpen }">
        <WorkspaceProjectCrudCreate :open="open" @update:open="setOpen" />
      </template>
      <template #read="{ open, setOpen }">
        <WorkspaceProjectCrudRead
          :open="open"
          :state="state"
          @update:open="setOpen"
        />
      </template>
    </WorkspaceCrud>
    <UAlert
      v-if="derived.status !== 'loading' && !state.project.id"
      color="neutral"
      variant="subtle"
      icon="i-lucide-briefcase-business"
      title="No Project selected"
      description="Create or select a Project to begin this Workspace."
    />
  </section>
</template>

<script setup lang="ts">
import WorkspaceProjectCrudCreate from './Crud/Create.vue'
import WorkspaceProjectCrudRead from './Crud/Read.vue'
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from '../../composables/workspace/index/useProjectWorkspaceIndex'

defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
}>()
</script>
