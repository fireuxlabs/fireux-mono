<template>
  <WorkspaceEntityCollection
    :outcome="index.outcome.value"
    :count="index.collection.value.length"
    entity="kitchens"
    title="My Kitchens"
    error-description="Kitchens could not be loaded."
    empty-title="No kitchens yet"
    empty-description="Your available kitchens will appear here."
    layout="list"
  >
    <template #actions>
      <UButton
        v-if="canCreate"
        label="Add Kitchen"
        icon="i-lucide-plus"
        @click="emit('create')"
      />
    </template>
    <WorkspaceSelectionRow
      v-for="kitchen in index.collection.value"
      :key="kitchen.id"
      :selected="kitchen.id === index.selectedId.value"
      @select="select(kitchen.id || '')"
    >
      <UAvatar v-bind="kitchenWorkspaceAvatar(kitchen)" />
      <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
    </WorkspaceSelectionRow>
  </WorkspaceEntityCollection>
</template>

<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
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
async function select(id: string) {
  await props.index.select(id)
  if (props.openOnSelect) void navigateTo(workspaceEntryPath.value)
}
</script>
