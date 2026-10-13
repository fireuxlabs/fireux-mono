<template>
  <KitchenGroupIndex nav-key="workspace-kitchen-orders">
    <WorkspaceKitchenOfferingsControls />
    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold">Venue hours</h2>
          <p class="text-sm text-muted">
            Set venue opening hours. Serving times are configured within each
            offering.
          </p>
        </div>
        <UButton
          to="/workspace/kitchen/identity/operating-hours"
          label="Edit venue hours"
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
      'Configure your Kitchen and save or reopen order drafts. Submission and fulfilment are being rebuilt.',
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
        label: 'Order drafts',
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
