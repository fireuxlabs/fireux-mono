<!-- Ignition is FireUX App intake with a private app-admin delivery workflow; it is not a Project Operation. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-project-ignitions">
      <template #header>
        <LayoutsConsoleNavbar title="Ignition Requests" />
      </template>

      <template #body>
        <IgnitionQueue />
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
    key: 'console-project-ignitions',
    label: 'Ignition',
    icon: 'i-lucide-rocket',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
})
</script>
