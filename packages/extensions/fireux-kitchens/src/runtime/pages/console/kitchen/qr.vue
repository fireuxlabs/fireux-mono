<template>
  <UDashboardPanel id="console-kitchen-qr">
    <template #header>
      <LayoutsConsoleNavbar title="QR" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Kitchen and app
            </h2>
          </template>

          <p class="text-sm text-dimmed">
            Kitchen and app QR surfaces will live here. Menu entry QR codes are below.
          </p>
        </UCard>

        <ConsoleKitchenOperationsMenusQR />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-qr',
    label: 'QR',
    icon: 'i-lucide-qr-code',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
