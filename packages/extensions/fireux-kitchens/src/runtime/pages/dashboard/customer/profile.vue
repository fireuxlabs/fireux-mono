<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: move Customer creation, editing, and orders into the authenticated dashboard. -->
<!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: show authenticated Order links without requiring a separate Customer profile record. -->
<template>
  <UDashboardPanel id="dashboard-customer-profile">
    <template #header>
      <FireLayoutsDashboardNavbar title="Customer" />
    </template>

    <template #body>
      <div class="workspace-profile">
        <CustomerIdentity />

        <ClientOnly>
          <div v-if="customerProfile" class="workspace-profile__section">
            <CustomerEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useCustomer } from '../../../user/composables/customer/useCustomer'

const { customerProfile } = useCustomer()

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['customer'] },
    key: 'dashboard-customer-profile',
    label: 'Customer',
    icon: 'i-lucide-receipt-text',
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'customer',
  },
  requiresAuth: true,
})
</script>
