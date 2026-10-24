<!-- Ignition is FireUX App intake with a private app-admin delivery workflow; it is not a Project Operation. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-ignitions">
      <template #header>
        <WorkspaceNavbar title="Ignition Requests" />
      </template>

      <template #body>
        <IgnitionQueue />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-ignitions',
    label: 'Ignition',
    icon: 'i-lucide-rocket',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
})
</script>
