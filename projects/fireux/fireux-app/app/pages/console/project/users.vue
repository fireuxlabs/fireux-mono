<!-- Concurrent edit — 2026-07-21 13:16 CEST — Project Users Operation: reserve the canonical Console home and point to its roadmap. -->
<template>
  <UDashboardPanel id="console-project-users">
    <template #header>
      <LayoutsConsoleNavbar title="Project Users" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Manage your users"
        description="This Operation is being built against the published roadmap."
        :actions="[
          {
            label: 'View roadmap',
            to: '/operations/users',
            color: 'neutral',
            variant: 'soft',
          },
        ]"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'console-project-users',
    label: 'Users',
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
