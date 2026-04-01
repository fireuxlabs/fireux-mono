<template>
  <UDashboardPanel id="console-projects-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Project" />
    </template>

    <template #body>
      <ProjectCreateSystem
        mode="console"
        return-to="/console/projects"
        cancel-to="/console/projects"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
