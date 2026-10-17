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
  <nav
    v-if="selected"
    aria-label="Kitchen tools"
    class="grid gap-3 sm:grid-cols-3"
  >
    <UButton
      to="/workspace/kitchen/food/dishes"
      label="Food &amp; drinks"
      icon="i-lucide-utensils"
      color="neutral"
      variant="outline"
    />
    <UButton
      to="/workspace/kitchen/menus"
      label="Menus"
      icon="i-lucide-book-open"
      color="neutral"
      variant="outline"
    />
    <UButton
      to="/workspace/kitchen/services"
      label="Services"
      icon="i-lucide-shopping-bag"
      color="neutral"
      variant="outline"
    />
  </nav>
  <WorkspaceKitchenHomeEdit v-model:open="editOpen" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { kitchenWorkspaceAvatar } from '../../../utils/kitchen-workspace-avatar'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/useKitchenWorkspaceIndex'

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
