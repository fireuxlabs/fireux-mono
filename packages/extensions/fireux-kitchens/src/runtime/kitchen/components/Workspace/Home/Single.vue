<template>
  <WorkspaceSingleCard
    v-if="selected"
    :name="selected.display_name || selected.id || 'Kitchen'"
    :description="selected.tagline || selected.about"
    to="/workspace/kitchen/identity"
  >
    <template #avatar>
      <UAvatar
        :src="selected.display_image_url || undefined"
        :alt="selected.display_name"
        icon="i-lucide-chef-hat"
        size="xl"
      />
    </template>
    <span v-if="selected.short_address || selected.formatted_address">{{
      selected.short_address || selected.formatted_address
    }}</span>
    <UBadge
      v-if="selected.status"
      :color="selected.status === 'active' ? 'success' : 'neutral'"
      variant="subtle"
      >{{
        selected.status === 'active'
          ? 'Active'
          : selected.status === 'archived'
            ? 'Archived'
            : 'Inactive'
      }}</UBadge
    >
  </WorkspaceSingleCard>
  <p v-else class="fx-type-caption">Choose a Kitchen from the collection.</p>
  <WorkspaceKitchenCrudUpdate v-model:open="editOpen" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import WorkspaceKitchenCrudUpdate from '../Crud/Update.vue'

const props = defineProps<{
  selected:
    | ReturnType<typeof useKitchenWorkspaceIndex>['collection']['value'][number]
    | undefined
  canUpdate: boolean
}>()
const editOpen = ref(false)
function openEdit() {
  if (props.selected && props.canUpdate) editOpen.value = true
}
defineExpose({ openEdit })
</script>
