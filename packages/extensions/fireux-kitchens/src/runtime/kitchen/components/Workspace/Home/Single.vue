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
  <KitchenIdentityListingEdit v-model:open="editOpen" :identity="identity" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { kitchenWorkspaceAvatar } from '../../../utils/kitchen-workspace-avatar'
import type { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import type { KitchenWorkspaceIdentityState } from '../../../composables/workspace/useKitchenWorkspaceIdentity'

const props = defineProps<{
  selected:
    | ReturnType<typeof useKitchenWorkspace>['collection']['value'][number]
    | undefined
  identity: KitchenWorkspaceIdentityState
}>()
const editOpen = ref(false)
function openEdit() {
  if (props.selected && props.identity.canWriteKitchen.value)
    editOpen.value = true
}
defineExpose({ openEdit })
</script>
