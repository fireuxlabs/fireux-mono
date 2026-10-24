<template>
  <WorkspaceEntityCollection
    :outcome="index.outcome.value"
    :count="index.collection.value.length"
    entity="projects"
    title="My Projects"
    error-description="Projects could not be loaded."
    empty-title="No projects yet"
    empty-description="Your available projects will appear here."
    layout="list"
  >
    <template #actions>
      <UButton
        label="Create Project"
        icon="i-lucide-plus"
        :disabled="!canCreate"
        @click="emit('create')"
      />
    </template>
    <WorkspaceSelectionRow
      v-for="project in index.collection.value"
      :key="project.id"
      :selected="project.id === index.selectedId.value"
      @select="select(project.id)"
    >
      <UAvatar
        :src="projectIdentityMedia(project, publication).imageUrl || undefined"
        :ui="
          projectIdentityMedia(project, publication).imageFit === 'contain'
            ? { image: 'object-contain p-1' }
            : undefined
        "
        :alt="project.identity.name"
        icon="i-lucide-briefcase-business"
      />
      <span class="truncate">{{ project.identity.name || project.id }}</span>
    </WorkspaceSelectionRow>
  </WorkspaceEntityCollection>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { projectIdentityMedia } from '../../../utils/project-identity-media'
import type { ProjectPublishedIdentity } from '../../../models/published-identity'
import type { useProjectWorkspaceIndex } from '../../../composables/workspace/useProjectWorkspaceIndex'

const props = defineProps<{
  index: ReturnType<typeof useProjectWorkspaceIndex>
  canCreate: boolean
  publication?: ProjectPublishedIdentity | null
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
async function select(id: string) {
  await props.index.select(id)
  if (props.openOnSelect) void navigateTo('/')
}
</script>
