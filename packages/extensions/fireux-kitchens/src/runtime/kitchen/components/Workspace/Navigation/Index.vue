<template>
  <div
    v-if="!backdropOnly && identityOnly && selected"
    class="workspace-navbar__identity"
  >
    <UAvatar :alt="item.label" :icon="item.icon" size="2xs" />
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
    workspace-label="Kitchen"
  />
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceEntryCta'
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-workspace/runtime/workspace/components/EntitySwitcher.vue'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'

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
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Kitchens unavailable'
      : selected.value?.name || 'Kitchen Workspace',
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-chef-hat',
  choices:
    workspace.multipleKitchenView.value &&
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.map((kitchen) => ({
          label: kitchen.name,
          onSelect: () => workspace.select(kitchen.id),
        }))
      : [],
}))
</script>
