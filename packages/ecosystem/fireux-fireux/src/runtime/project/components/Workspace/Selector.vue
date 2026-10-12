<template>
  <section
    id="workspace-entity-controls"
    class="flex flex-wrap items-center gap-2"
    aria-label="Project selector"
  >
    <WorkspaceProjectSelectorChoices
      v-if="index.collection.value.length"
      :collection="index.collection.value"
      :selected-id="index.selectedId.value"
      :publication="publication"
      @select="index.select"
    />
    <span v-if="index.outcome.value === 'pending'" role="status"
      >Loading Projects…</span
    >
    <UAlert
      v-else-if="index.outcome.value === 'error'"
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
      v-else-if="index.collection.value.length && creation.canCreate.value"
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
import { useWorkspaceCreation } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceCreation'
import { useProjectWorkspaceIndex } from '../../composables/workspace/useProjectWorkspaceIndex'

withDefaults(
  defineProps<{
    showUpgrade?: boolean
    publication?: ProjectPublishedIdentity | null
  }>(),
  { showUpgrade: true }
)
const createOpen = ref(false)
const index = useProjectWorkspaceIndex()
const creation = useWorkspaceCreation('project', () => ({
  count: index.access.ids.value.length,
  outcome: index.access.outcome.value,
}))

function created() {
  createOpen.value = false
}
</script>
