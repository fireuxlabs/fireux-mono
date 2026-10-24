<template>
  <section
    id="workspace-entity-controls"
    class="flex flex-wrap items-center gap-2"
    aria-label="Project selector"
  >
    <WorkspaceProjectSelectorChoices
      v-if="workspace.collection.value.length"
      :collection="workspace.collection.value"
      :selected-id="workspace.id.value"
      :publication="publication"
      @select="workspace.select"
    />
    <span v-if="workspace.collectionOutcome.value === 'pending'" role="status"
      >Loading Projects…</span
    >
    <UAlert
      v-else-if="workspace.collectionOutcome.value === 'error'"
      color="error"
      title="Projects could not be loaded"
    />
    <UButton
      v-if="showUpgrade && creation.showUpgrade.value"
      to="/pricing"
      label="Upgrade to manage more"
      icon="i-lucide-arrow-up-right"
      color="primary"
      variant="soft"
    />
    <UButton
      v-else-if="workspace.collection.value.length && creation.canCreate.value"
      label="Create workspace"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      aria-label="Create Project"
      @click="createOpen = true"
    />

    <UModal v-model:open="createOpen" title="Create Project">
      <template #body>
        <WorkspaceProjectHomeCreateForm @created="created" />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
import { useProjectWorkspace } from '../../composables/workspace/useProjectWorkspace'

withDefaults(
  defineProps<{
    showUpgrade?: boolean
    publication?: ProjectPublishedIdentity | null
  }>(),
  { showUpgrade: true }
)
const createOpen = ref(false)
const workspace = useProjectWorkspace()
const creation = useWorkspaceCreation('project', () => ({
  count: workspace.access.ids.value.length,
  outcome: workspace.access.outcome.value,
}))

function created() {
  createOpen.value = false
}
</script>
