<template>
  <div
    v-if="!backdropOnly && identityOnly && selected"
    class="workspace-navbar__identity"
  >
    <UAvatar
      v-bind="item.avatar"
      :alt="item.label"
      :icon="item.icon"
      size="2xs"
    />
    <span class="fx-truncate">{{ item.label }}</span>
  </div>
  <WorkspaceEntitySwitcher
    v-else-if="!backdropOnly && !identityOnly"
    :item="item"
    :to="workspaceEntryPath"
    :collapsed="collapsed"
    :pending="
      workspace.collectionOutcome.value === 'pending' ||
      workspace.collectionOutcome.value === 'idle'
    "
    workspace-label="Project"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../../models/project.model'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useProjectWorkspace } from '../../composables/workspace/useProjectWorkspace'

withDefaults(
  defineProps<{
    collapsed?: boolean
    identityOnly?: boolean
    backdropOnly?: boolean
  }>(),
  {
    collapsed: false,
    identityOnly: false,
    backdropOnly: false,
  }
)
const workspace = useProjectWorkspace()
const { workspaceEntryPath } = useWorkspaceEntryCta('project')
const selected = computed(() =>
  workspace.collection.value.find(
    (project) => project.id === workspace.id.value
  )
)
function avatar(project: Project | null | undefined) {
  return {
    src: project?.identity.image_url || undefined,
    alt: project?.identity.name || project?.id || 'Project',
    icon: 'i-lucide-briefcase-business',
  }
}
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Projects unavailable'
      : selected.value?.identity.name ||
        selected.value?.id ||
        'Project Workspace',
  avatar: avatar(
    workspace.collectionOutcome.value === 'ready' ? selected.value : null
  ),
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-briefcase-business',
  choices:
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.map((project) => ({
          label: project.identity.name || project.id,
          avatar: avatar(project),
          onSelect: () => workspace.select(project.id),
        }))
      : [],
}))
</script>
