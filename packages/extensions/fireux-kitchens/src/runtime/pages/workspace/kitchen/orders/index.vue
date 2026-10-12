<template>
  <KitchenGroupIndex nav-key="workspace-kitchen-orders">
    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold">Ordering hours</h2>
          <p class="text-sm text-muted">
            Review Kitchen hours and the schedules for each offering.
          </p>
        </div>
        <UButton
          to="/workspace/kitchen/identity/operating-hours"
          label="Configure hours"
          icon="i-lucide-clock"
          color="neutral"
          variant="soft"
        />
      </div>
    </UCard>
  </KitchenGroupIndex>
</template>
<script setup lang="ts">
import KitchenGroupIndex from '../../../../kitchen/components/Workspace/GroupIndex.vue'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders',
    description:
      'Review how your Kitchen takes orders, then open the Order board to run service.',
    groupIndex: true,
    group: '',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Order board',
        to: '/workspace/kitchen/orders/board',
        icon: 'i-lucide-panels-top-left',
      },
      {
        label: 'Offerings',
        to: '/workspace/kitchen/offerings',
        icon: 'i-lucide-shopping-bag',
      },
      {
        label: 'Delivery & payments',
        to: '/workspace/kitchen/fulfilment',
        icon: 'i-lucide-truck',
      },
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
