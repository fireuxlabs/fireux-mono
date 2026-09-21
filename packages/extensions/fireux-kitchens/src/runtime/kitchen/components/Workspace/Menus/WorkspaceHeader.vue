<template>
  <div class="min-w-0 space-y-4">
    <UBreadcrumb :ui="{ list: 'flex-wrap' }" :items="breadcrumbItems" />
    <WorkspaceKitchenMenusIdentityBar v-if="!source || menu" />
    <h1 v-else class="text-3xl font-semibold tracking-tight text-highlighted">
      {{ menuLabel }}
    </h1>
    <WorkspaceKitchenMenusNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menus/useKitchenWorkspaceMenu'

const props = withDefaults(
  defineProps<{
    currentLabel?: string
  }>(),
  {
    currentLabel: '',
  }
)

const { menu, menuSlug, source, selectedKitchen } = useKitchenWorkspaceMenu()
const menuPath = computed(
  () => `/workspace/kitchen/menus/${encodeURIComponent(menuSlug.value)}`
)
const menuLabel = computed(() =>
  String(menu.value?.name || source.value?.id || 'Menu').trim()
)
const breadcrumbItems = computed(() => [
  {
    label: selectedKitchen.value?.name || 'Kitchen',
    to: workspaceEntryPath.value,
  },
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/workspace/kitchen/menus',
  },
  {
    label: menuLabel.value,
    icon: 'i-lucide-list-tree',
    ...(props.currentLabel ? { to: menuPath.value } : {}),
  },
  ...(props.currentLabel
    ? [
        {
          label:
            props.currentLabel === 'Content'
              ? menu.value?.schedule === 'daily'
                ? 'Calendar'
                : 'Items & prices'
              : props.currentLabel,
        },
      ]
    : []),
])
</script>
