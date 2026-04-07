<template>
  <UDashboardPanel id="parked-console-route">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Not wired yet"
        description="This supplier console route is parked while the live-only supplier seam is normalized."
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
