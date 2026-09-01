<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Project selector"
  >
    <template v-if="derived.outcome === 'pending'">
      <USkeleton class="h-8 w-36 rounded-md" />
    </template>
    <WorkspaceProjectSelectorChoices
      v-else-if="state.project.id || derived.canSelectMultiple"
      :project="state.project"
      :can-select-multiple="derived.canSelectMultiple"
      :project-ids="state.user.projects"
      :refresh="refresh"
    />
    <UButton
      v-if="derived.canSelectMultiple && derived.canCreate"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Project"
      @click="createOpen = true"
    />

    <UModal v-model:open="createOpen" title="Create Project">
      <template #body>
        <WorkspaceProjectCreateForm @created="created" />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

async function created() {
  await props.refresh()
  createOpen.value = false
}
</script>
