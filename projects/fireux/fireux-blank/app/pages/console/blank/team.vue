<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-blank-team">
      <template #header>
        <LayoutsConsoleNavbar title="Blank Team" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleBlankTeam />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-blank-team',
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
