<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-purchases',
    label: 'Purchases',
    icon: 'i-lucide-shopping-cart',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
</script>

<template>
  <!-- Note: If billing/subscription details are reintroduced, mirror archived cards from dash-old/dashboard/subscriptions.vue. -->
  <UDashboardPanel id="dashboard-purchases">
    <template #header>
      <LayoutsDashboardNavbar title="Purchases" />
    </template>

    <template #body>
      <UPage>
        <UPageBody>
          <UPageHeader
            description="Products you have bought."
          />
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">
              No purchases yet.
            </p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
