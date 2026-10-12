<template>
  <header class="workspace-panel-header">
    <h2 class="fx-type-card-title">My Kitchens</h2>
    <UButton
      v-if="canCreate"
      label="Add Kitchen"
      icon="i-lucide-plus"
      @click="emit('create')"
    />
  </header>
  <p v-if="index.outcome.value === 'pending'" role="status">
    Loading Kitchens…
  </p>
  <UAlert
    v-else-if="index.outcome.value === 'error'"
    color="error"
    title="Kitchens could not be loaded"
  />
  <div
    v-else-if="index.collection.value.length"
    class="grid min-w-0 grid-cols-1 gap-2"
  >
    <WorkspaceSelectionRow
      v-for="kitchen in index.collection.value"
      :key="kitchen.id"
      :selected="kitchen.id === index.selectedId.value"
      @select="select(kitchen.id || '')"
    >
      <UAvatar v-bind="kitchenWorkspaceAvatar(kitchen)" />
      <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
    </WorkspaceSelectionRow>
  </div>
  <p v-else-if="!canCreate" class="text-sm text-muted">No Kitchens to show.</p>
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { navigateTo } from '#imports'
import { kitchenWorkspaceAvatar } from '../../../utils/kitchen-workspace-avatar'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/useKitchenWorkspaceIndex'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')

const props = defineProps<{
  index: ReturnType<typeof useKitchenWorkspaceIndex>
  canCreate: boolean
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
function select(id: string) {
  props.index.select(id)
  if (props.openOnSelect) void navigateTo(workspaceEntryPath.value)
}
</script>
