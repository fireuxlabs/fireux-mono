<template>
  <UDashboardPanel id="console-property-qr">
    <template #header>
      <LayoutsConsoleNavbar title="Property QR" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="QR"
        description="Property QR scaffold."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-qr',
    label: 'QR',
          icon: 'i-lucide-qr-code',
          position: 'top',
          requiresSelection: true,
          order: 5,
          desktop: true,
          mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
