<template>
  <UDashboardPanel id="parked-console-route">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Not wired yet"
        description="This kitchen console route is parked while the live-only kitchen seam is normalized."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
