<template>
  <div class="min-w-0 space-y-4">
    <UBreadcrumb :ui="{ list: 'flex-wrap' }" :items="breadcrumbItems" />
    <WorkspaceKitchenMenusDetailIdentity v-if="menu" />
    <h1 v-else class="text-3xl font-semibold tracking-tight text-highlighted">
      {{ menuLabel }}
    </h1>
    <WorkspaceKitchenMenusDetailNavigation v-if="menu" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'

const { menu, source, selectedKitchen } = useKitchenMenuRecordContext()
const menuLabel = computed(() =>
  String(menu.value?.internal_name || menu.value?.name || source.value?.id || 'Menu').trim()
)
const breadcrumbItems = computed(() => [
  {
    label: selectedKitchen.value?.name || 'Kitchen',
    to: workspaceEntryPath.value,
  },
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/workspace/kitchen/food-and-drink/menus',
  },
  {
    label: menuLabel.value,
    icon: 'i-lucide-list-tree',
  },
])
</script>
