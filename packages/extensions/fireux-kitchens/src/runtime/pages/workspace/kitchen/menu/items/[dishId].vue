<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <KitchenWorkspaceMenuItemsDetail
    :item="item"
    :outcome="outcome"
    :menu="typeof route.query.menu === 'string' ? route.query.menu.trim() : ''"
    :kitchen-slug="data?.slug"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import KitchenWorkspaceMenuItemsDetail from '../../../../../kitchen/components/Workspace/Menu/Items/Detail/Index.vue'
import { useKitchenWorkspace } from '../../../../../kitchen/composables/workspace/useKitchenWorkspace'
import { useKitchenItemRead } from '../../../../../kitchen/composables/items/useKitchenItemRead'
import { provideKitchenItemContext } from '../../../../../kitchen/composables/items/useKitchenItemContext'

definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-dish-detail',
    label: 'Item details',
    icon: 'i-lucide-utensils',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})

const route = useRoute()
const { id, outcome: workspaceOutcome, data } = useKitchenWorkspace()
const { item, outcome: itemOutcome } = provideKitchenItemContext(
  useKitchenItemRead(
    () => (workspaceOutcome.value === 'ready' ? id.value : ''),
    useRouteParam('dishId')
  )
)
const outcome = computed(() => {
  if (
    workspaceOutcome.value === 'pending' ||
    workspaceOutcome.value === 'error'
  )
    return workspaceOutcome.value
  if (workspaceOutcome.value !== 'ready') return 'idle'
  return itemOutcome.value === 'ready' && !item.value
    ? 'error'
    : itemOutcome.value
})
</script>
