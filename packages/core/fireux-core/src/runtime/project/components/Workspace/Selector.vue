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
        <WorkspaceProjectCreateForm @created="created" />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

withDefaults(defineProps<{ showUpgrade?: boolean }>(), { showUpgrade: true })
const creation = useWorkspaceCreation('project')
const createOpen = ref(false)
const index = useProjectWorkspaceIndex()

function created() {
  createOpen.value = false
}
</script>
