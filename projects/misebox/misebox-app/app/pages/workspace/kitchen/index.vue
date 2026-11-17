<template><KitchenHome /></template>
<script setup lang="ts">
import KitchenHome from '../../../components/Workspace/KitchenHome.vue'
definePageMeta({
  layout: 'workspace',

  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Home',
    description: 'Kitchen Workspace',
    icon: 'i-lucide-house',
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
useSeoMeta({
  title: 'Kitchen Workspace | Misebox',
  robots: 'noindex, nofollow',
})
</script>
