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
      workspace.collectionOutcome.value === 'pending' ||
      workspace.collectionOutcome.value === 'idle'
    "
    workspace-label="Kitchen"
  />
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { kitchenWorkspaceAvatar } from '../../../utils/kitchen-workspace-avatar'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')

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
const workspace = useKitchenWorkspace()
const selected = computed(() =>
  workspace.collection.value.find(
    (kitchen) => kitchen.id === workspace.id.value
  )
)
const backdropImage = computed(
  () =>
    selected.value?.cover_image ||
    (selected.value?.image_kind === 'photograph'
      ? selected.value?.display_image_url
      : '')
)
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Kitchens unavailable'
      : selected.value?.display_name ||
        selected.value?.id ||
        'Kitchen Workspace',
  avatar:
    workspace.collectionOutcome.value === 'ready'
      ? kitchenWorkspaceAvatar(selected.value)
      : undefined,
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-chef-hat',
  choices:
    workspace.multipleKitchenView.value &&
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.map((kitchen) => ({
          label: kitchen.display_name || kitchen.id,
          avatar: kitchenWorkspaceAvatar(kitchen),
          onSelect: () => workspace.select(kitchen.id || ''),
        }))
      : [],
}))
</script>
