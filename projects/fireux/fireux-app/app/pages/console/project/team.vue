<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-project-team">
      <template #header>
        <LayoutsConsoleNavbar title="Project Team" />
      </template>

      <template #body>
        <section class="space-y-6">
          <ConsoleProjectOperationsTeam />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['admin'],
})
</script>
