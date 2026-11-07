<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Your Projects"
  >
    <WorkspaceProjectHomeCollection
      :workspace="workspace"
      :can-create="creation.canCreate.value"
      @create="createOpen = true"
      @selected="navigateTo('/workspace/project')"
    />
    <WorkspaceProjectHomeCreate
      v-if="creation.canCreate.value"
      v-model:open="createOpen"
    />
  </section>
</template>
<script setup lang="ts">
import { navigateTo } from '#imports'
import { ref } from 'vue'
import { useProjectWorkspace } from 'fireux-projects/runtime/project/composables/workspace/useProjectWorkspace'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'

const workspace = useProjectWorkspace()
const createOpen = ref(false)
const creation = useWorkspaceCreation('project', () => ({
  count: workspace.access.ids.value.length,
  outcome: workspace.access.outcome.value,
}))
</script>
