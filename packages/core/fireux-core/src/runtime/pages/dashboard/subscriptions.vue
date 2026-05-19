<template>
  <UDashboardPanel id="dashboard-subscriptions">
    <template #header>
      <LayoutsDashboardNavbar title="Subscriptions" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
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
    visibility: { dashboardPages: ['subscriptions'] },
    key: 'dashboard-subscriptions',
    label: 'Subscriptions',
    icon: 'i-lucide-credit-card',
    position: 'bottom',
    order: 40,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
</script>
