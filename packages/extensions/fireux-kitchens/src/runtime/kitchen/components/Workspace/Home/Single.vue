<template>
  <WorkspaceSingleCard
    v-if="selected"
    :name="selected.display_name || selected.id || 'Kitchen'"
    :description="selected.tagline || selected.about"
    to="/workspace/kitchen/identity"
  >
    <template #avatar>
      <UAvatar v-bind="kitchenWorkspaceAvatar(selected)" size="xl" />
    </template>
    <span v-if="selected.short_address || selected.formatted_address">{{
      selected.short_address || selected.formatted_address
    }}</span>
  </WorkspaceSingleCard>
  <p v-else class="fx-type-caption">Choose a Kitchen.</p>
  <WorkspaceKitchenHomeEdit v-model:open="editOpen" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { kitchenWorkspaceAvatar } from '../../../utils/kitchen-workspace-avatar'
import type { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'

const props = defineProps<{
  selected:
    | ReturnType<typeof useKitchenWorkspace>['collection']['value'][number]
    | undefined
  canUpdate: boolean
}>()
const editOpen = ref(false)
function openEdit() {
  if (props.selected && props.canUpdate) editOpen.value = true
}
defineExpose({ openEdit })
</script>
