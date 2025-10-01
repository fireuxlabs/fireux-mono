<script setup lang="ts">
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
  <UPage>
    <UPageBody>
      <UPageHeader title="Purchases" description="Products you have bought." />
      <UPageCard variant="subtle">
        <p class="text-sm text-dimmed">
          Placeholder: purchases list will appear here.
        </p>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>
