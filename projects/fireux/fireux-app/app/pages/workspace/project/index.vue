<template>
  <WorkspaceProjectHome />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Project',
    group: 'Workspace',
    description: 'Project Workspace',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useSeoMeta({ title: 'Project Workspace | FireUX', robots: 'noindex, nofollow' })
</script>
