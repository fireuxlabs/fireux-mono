<template>
  <template v-if="backdropOnly">
    <img
      v-if="backdropImage"
      :src="backdropImage"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      style="opacity: 0.35; filter: blur(3px); transform: scale(1.25)"
    />
    <div
      v-if="backdropImage"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0"
      style="
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--ui-bg) 80%, transparent),
          color-mix(in srgb, var(--ui-bg) 45%, transparent),
          color-mix(in srgb, var(--ui-bg) 90%, transparent)
        );
      "
    />
  </template>
  <div
    v-else-if="identityOnly && selected"
    class="flex min-w-0 items-center gap-2"
  >
    <UAvatar
      v-bind="item.avatar"
      :alt="item.label"
      :icon="item.icon"
      size="2xs"
    />
    <span class="truncate text-sm font-medium">{{ item.label }}</span>
  </div>
  <WorkspaceEntitySwitcher
    v-else-if="!identityOnly"
    :item="item"
    :to="workspaceEntryPath"
    :collapsed="collapsed"
    :pending="
      index.outcome.value === 'pending' || index.outcome.value === 'idle'
    "
    workspace-label="Project"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectIdentityMedia } from '../../utils/project-identity-media'
import { useProjectAppContext } from '../../composables/workspace/identity/useProjectAppContext'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/components/Workspace/EntitySwitcher.vue'
import { useProjectWorkspaceIndex } from '../../composables/workspace/useProjectWorkspaceIndex'

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
const index = useProjectWorkspaceIndex()
const { publication } = useProjectAppContext()
const { workspaceEntryPath } = useWorkspaceEntryCta('project')
const selected = computed(() =>
  index.collection.value.find(
    (project) => project.id === index.selectedId.value
  )
)
const backdropImage = computed(() => '')
function avatar(project: Parameters<typeof projectIdentityMedia>[0]) {
  const media = projectIdentityMedia(project, publication.value)
  return {
    src: media.imageUrl || undefined,
    alt: project?.identity.name || project?.id || 'Project',
    icon: 'i-lucide-briefcase-business',
    ui:
      media.imageFit === 'contain'
        ? { image: 'object-contain p-0.5' }
        : undefined,
  }
}
const item = computed(() => ({
  label:
    index.outcome.value === 'error'
      ? 'Projects unavailable'
      : selected.value?.identity.name ||
        selected.value?.id ||
        'Project Workspace',
  avatar: avatar(index.outcome.value === 'ready' ? selected.value : null),
  icon:
    index.outcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-briefcase-business',
  choices:
    index.outcome.value === 'ready' && index.collection.value.length > 1
      ? index.collection.value.map((project) => ({
          label: project.identity.name || project.id,
          avatar: avatar(project),
          onSelect: () => index.select(project.id),
        }))
      : [],
}))
</script>
