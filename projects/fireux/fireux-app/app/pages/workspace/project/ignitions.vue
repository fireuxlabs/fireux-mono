<!-- Ignition is FireUX App intake with a private app-admin delivery workflow; it is not a Project Operation. -->
<template>
  <IgnitionQueue />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
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
