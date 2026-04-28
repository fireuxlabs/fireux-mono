<template>
  <UDashboardPanel id="console-kitchen-training">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Training" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Kitchen training is parked"
          description="This kitchen console route is intentionally hidden until the training workspace is wired."
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
    key: 'console-kitchen-training',
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 84,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
