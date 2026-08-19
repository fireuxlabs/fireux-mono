<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-supplier-identity">
      <template #header>
        <LayoutsConsoleNavbar :title="navTitle">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Supplier Identity" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <div class="console-profile">
          <ConsoleSupplierIdentity />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const navTitle = 'Supplier Identity'

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'console-supplier-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
