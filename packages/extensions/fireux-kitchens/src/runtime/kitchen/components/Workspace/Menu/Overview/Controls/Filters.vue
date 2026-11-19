<template>
  <WorkspaceKitchenCollectionToolbar
    v-model="query"
    label="menus"
    singular="menu"
    :count="count"
  >
    <template #controls>
      <USelect
        v-model="status"
        :items="statusOptions"
        icon="i-lucide-list-filter"
        aria-label="Menu status"
      />
    </template>
  </WorkspaceKitchenCollectionToolbar>
</template>
<script setup lang="ts">
import type { MenuListStatus } from '../../../../../composables/workspace/menu/menus/useMenuList'

defineProps<{
  count: number
  statusOptions: Array<{ label: string; value: MenuListStatus }>
}>()
const query = defineModel<string>('query', { required: true })
const status = defineModel<MenuListStatus>('status', { required: true })
</script>
