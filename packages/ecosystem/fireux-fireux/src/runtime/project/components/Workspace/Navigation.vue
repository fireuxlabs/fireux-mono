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
    <UAvatar :src="item.image" :alt="item.label" :icon="item.icon" size="2xs" />
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
const { workspaceEntryPath } = useWorkspaceEntryCta('project')
const selected = computed(() =>
  index.collection.value.find(
    (project) => project.id === index.selectedId.value
  )
)
const backdropImage = computed(() => '')
const item = computed(() => ({
  label:
    index.outcome.value === 'error'
      ? 'Projects unavailable'
      : selected.value?.name || selected.value?.id || 'Project Workspace',
  image: index.outcome.value === 'ready' ? selected.value?.image_url : '',
  icon:
    index.outcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-briefcase-business',
  choices:
    index.outcome.value === 'ready' && index.collection.value.length > 1
      ? index.collection.value.map((project) => ({
          label: project.name || project.id,
          avatar: {
            src: project.image_url || undefined,
            alt: project.name || project.id,
            icon: 'i-lucide-briefcase-business',
          },
          onSelect: () => index.select(project.id),
        }))
      : [],
}))
</script>
