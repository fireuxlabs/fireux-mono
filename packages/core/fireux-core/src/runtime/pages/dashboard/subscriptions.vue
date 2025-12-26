<template>
  <UDashboardPanel id="dashboard-subscriptions">
    <template #header>
      <UDashboardNavbar title="Subscriptions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPage>
        <UPageBody>
          <UPageHeader
            description="Billing and subscriptions appear when modules enable commerce."
          />

          <UPageCard
            title="Not configured"
            description="No subscription features are installed for this app yet."
            variant="subtle"
          >
            <p class="text-sm text-dimmed">Nothing to manage yet.</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-subscriptions',
    label: 'Subscriptions',
    icon: 'i-lucide-credit-card',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
</script>
