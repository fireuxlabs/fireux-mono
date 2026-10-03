<template>
  <header class="workspace-panel-header">
    <h2 class="fx-type-card-title">My Projects</h2>
    <UButton
      label="Create Project"
      icon="i-lucide-plus"
      :disabled="!canCreate"
      @click="emit('create')"
    />
  </header>
  <p v-if="index.outcome.value === 'pending'" role="status">
    Loading Projects…
  </p>
  <UAlert
    v-else-if="index.outcome.value === 'error'"
    color="error"
    title="Projects could not be loaded"
  />
  <div
    v-else-if="index.collection.value.length"
    class="grid min-w-0 grid-cols-1 gap-2"
  >
    <WorkspaceSelectionRow
      v-for="project in index.collection.value"
      :key="project.id"
      :selected="project.id === index.selectedId.value"
      @select="select(project.id)"
    >
      <UAvatar
        :src="project.image_url || undefined"
        :alt="project.name"
        icon="i-lucide-briefcase-business"
      />
      <span class="truncate">{{ project.name || project.id }}</span>
    </WorkspaceSelectionRow>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { useProjectWorkspaceIndex } from '../../../composables/workspace/useProjectWorkspaceIndex'

const props = defineProps<{
  index: ReturnType<typeof useProjectWorkspaceIndex>
  canCreate: boolean
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
function select(id: string) {
  props.index.select(id)
  if (props.openOnSelect) void navigateTo('/')
}
</script>
