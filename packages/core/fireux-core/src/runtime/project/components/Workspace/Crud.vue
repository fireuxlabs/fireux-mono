<template>
  <div>
    <WorkspaceCrudToolbar
      label="Project"
      :available="available"
      @create="createOpen = true"
      @read="openProject"
    />

    <UModal v-model:open="createOpen" title="Create Project">
      <template #body>
        <WorkspaceProjectCreateForm @created="created" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
const available = computed<Array<'create' | 'read'>>(() => [
  'create',
  ...(props.derived.hasSelection ? (['read'] as const) : []),
])

async function created() {
  await props.refresh()
  createOpen.value = false
}

async function openProject() {
  if (props.state.project.id) await navigateTo(`/projects/${props.state.project.id}`)
}
</script>
