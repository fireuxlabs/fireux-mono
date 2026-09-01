<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
    />

    <WorkspaceProjectCrudCreate v-model:open="createOpen" :refresh="refresh" />
    <WorkspaceProjectCrudRead v-model:open="readOpen" :state="state" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceProjectCrudRead from './Crud/Read.vue'
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  state: ProjectWorkspaceIndexState
  derived: ProjectWorkspaceIndexDerived
  refresh: () => Promise<unknown>
}>()

const createOpen = ref(false)
const readOpen = ref(false)
const available = computed<Array<'create' | 'read'>>(() => [
  'create',
  ...(props.state.appUser.projects.length ? (['read'] as const) : []),
])
</script>
