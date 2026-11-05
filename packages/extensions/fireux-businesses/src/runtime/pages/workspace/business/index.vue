<template>
  <UPageHeader title="Business" description="Manage your business profile, locations and Team." />
  <BusinessWorkspace />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false, workspacePage: true, workspace: 'business', workspaceSurface: 'browse',
  requiresAuth: true, requiresSelection: false,
  visibility: { modules: ['fireux-businesses'] },
  nav: { key: 'workspace-business', label: 'Business', icon: 'i-lucide-building-2', position: 'bottom', order: 850, desktop: true, mobile: true, layouts: ['workspace'] },
})
</script>
