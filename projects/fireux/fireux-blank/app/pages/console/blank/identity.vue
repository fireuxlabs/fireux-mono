<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-blank-identity">
      <template #header>
        <LayoutsConsoleNavbar title="Blank Identity" />
      </template>

      <template #body>
        <ConsoleBlankIdentity />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-blank-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
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
