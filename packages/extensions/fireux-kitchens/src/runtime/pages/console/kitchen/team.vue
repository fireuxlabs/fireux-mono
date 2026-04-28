<template>
  <UDashboardPanel id="console-kitchen-team">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Kitchen team is parked"
          description="This kitchen console route is intentionally hidden until the team workspace is wired."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 81,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
