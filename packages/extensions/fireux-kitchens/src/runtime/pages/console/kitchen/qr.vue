<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-qr',
    label: 'QR',
    icon: 'i-lucide-qr-code',
    position: 'top',
    hidden: true,
    order: 3,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
