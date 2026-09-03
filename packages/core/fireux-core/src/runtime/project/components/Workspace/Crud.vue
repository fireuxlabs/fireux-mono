<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
    />

    <WorkspaceProjectCrudCreate
      v-model:open="createOpen"
      :refresh="actions.refresh"
    />
    <WorkspaceProjectCrudRead v-model:open="readOpen" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceProjectCrudRead from './Crud/Read.vue'
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
  useProjectWorkspaceIndex,
} from '../../composables/workspace/index/useProjectWorkspaceIndex'

type Workspace = ReturnType<typeof useProjectWorkspaceIndex>

const props = defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
  actions: Workspace['actions']
}>()

const createOpen = ref(false)
const readOpen = ref(false)
const available = computed(() => props.derived.capability.availableActions)
</script>
