<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-supplier-catalogue">
      <template #header>
        <LayoutsConsoleNavbar title="Supplier Catalogue">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Supplier Catalogue" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleSupplierOperationsCatalogue />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'console-supplier-catalogue',
    label: 'Catalogue',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
