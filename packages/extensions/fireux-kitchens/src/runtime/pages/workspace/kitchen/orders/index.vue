<template>
  <section class="workspace-surface">
    <WorkspaceKitchenCapabilityTools operation="orders" />
    <WorkspaceKitchenCapabilityAI operation="orders" />
    <WorkspaceKitchenCapabilityView operation="orders" />
    <WorkspaceKitchenOrders v-if="hasKitchen" />
    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-list-checks"
      title="Select Kitchen to open the live Orders board"
      description="OrdersAI and capability information remain available without a selection. Live Order records require an authorized current Kitchen."
      :actions="[
        {
          label: 'Choose Kitchen',
          to: '/',
          icon: 'i-lucide-arrow-right',
        },
      ]"
    />
    <WorkspaceKitchenCapabilityGuidingLiterature operation="orders" />
    <WorkspaceKitchenResearchSegue
      capability="Orders & Service"
      base-path="/workspace/kitchen/orders/search-demand"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'

const kitchenWorkspace = useWorkspace('kitchen')
const hasKitchen = computed(() => Boolean(kitchenWorkspace.activeId.value))

definePageMeta({
  layout: 'kitchen-orders',
  workspaceSurface: 'live',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders & Service',
    group: 'Operations',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 22,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
