<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-recipes">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Recipes" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsRecipes />
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
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-copy',
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
