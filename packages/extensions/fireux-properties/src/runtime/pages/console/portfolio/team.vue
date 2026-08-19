<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-team">
      <template #header>
        <LayoutsConsoleNavbar title="Portfolio Team">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Portfolio Team" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsolePortfolioTeam />
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
    key: 'console-portfolio-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
