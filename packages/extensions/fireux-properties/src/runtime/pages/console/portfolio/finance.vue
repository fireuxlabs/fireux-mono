<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-finance">
      <template #header>
        <LayoutsConsoleNavbar title="Financial Signals">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Portfolio Finance" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <UAlert
            color="neutral"
            variant="soft"
            title="Portfolio finance is parked"
            description="This portfolio console route is intentionally hidden until finance views are wired."
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-finance',
    label: 'Financial Signals',
    icon: 'i-lucide-chart-line',
    position: 'top',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
