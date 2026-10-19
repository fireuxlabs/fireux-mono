<template>
  <WorkspaceKitchenNavigationGroup nav-key="workspace-kitchen-team"></WorkspaceKitchenNavigationGroup>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-team',
    label: 'Team',
    groupIndex: true,
    group: '',
    description:
      'Manage the people in your Kitchen and their responsibilities. Team roles do not grant Workspace access.',
    icon: 'i-lucide-users',
    position: 'top',
    order: 2,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'People',
        to: '/workspace/kitchen/team/people',
        icon: 'i-lucide-users',
      },
      {
        label: 'Responsibilities',
        to: '/workspace/kitchen/team/people#responsibilities',
        icon: 'i-lucide-user-check',
      },
    ],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
