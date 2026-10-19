<template>
  <WorkspaceKitchenNavigationGroup
    nav-key="workspace-kitchen-developer"
  ></WorkspaceKitchenNavigationGroup>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-developer',
    label: 'Developer',
    description:
      'Open Kitchen development tools. Test records are separate from operational Kitchen data.',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-code-2',
    position: 'top',
    order: 99,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Test',
        to: '/workspace/kitchen/developer/test',
        icon: 'i-lucide-flask-conical',
      },
    ],
  },
})
</script>
