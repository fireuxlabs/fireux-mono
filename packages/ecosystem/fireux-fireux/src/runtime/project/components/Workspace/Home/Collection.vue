<template>
  <WorkspaceEntityCollection
    :outcome="workspace.collectionOutcome.value"
    :count="workspace.collection.value.length"
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
      v-for="project in workspace.collection.value"
      :key="project.id"
      :selected="project.id === workspace.id.value"
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
import type { useProjectWorkspace } from '../../../composables/workspace/useProjectWorkspace'

const props = defineProps<{
  workspace: ReturnType<typeof useProjectWorkspace>
  canCreate: boolean
  publication?: ProjectPublishedIdentity | null
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
async function select(id: string) {
  await props.workspace.select(id)
  if (props.openOnSelect) void navigateTo('/')
}
</script>
