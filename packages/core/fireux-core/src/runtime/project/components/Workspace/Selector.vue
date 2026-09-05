<template>
  <section
    id="workspace-entity-controls"
    class="flex items-center gap-2"
    aria-label="Project selector"
  >
    <WorkspaceProjectSelectorChoices
      v-if="index.collection.value.length"
      :collection="index.collection.value"
      :selected-id="index.selectedId.value"
      @select="index.select"
    />
    <span v-if="index.outcome.value === 'pending'" role="status">Loading Projects…</span>
    <UAlert v-else-if="index.outcome.value === 'error'" color="error" title="Projects could not be loaded" />
    <UButton
      v-if="index.selectedId.value"
      color="neutral"
      variant="ghost"
      label="Clear selection"
      @click="index.clear"
    />
    <UButton
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
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const createOpen = ref(false)
const index = useProjectWorkspaceIndex()

function created() {
  createOpen.value = false
}
</script>
