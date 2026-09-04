<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
    />

    <WorkspaceProjectCrudCreate v-model:open="createOpen" />
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
}>()

const createOpen = ref(false)
const readOpen = ref(false)
const available = computed(() => props.derived.capability.availableActions)
</script>
