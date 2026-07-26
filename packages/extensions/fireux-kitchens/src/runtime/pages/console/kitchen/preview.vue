<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-preview">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Preview" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenSundriesPreview />
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
    key: 'console-kitchen-preview',
    label: 'Preview',
    icon: 'i-lucide-eye',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
