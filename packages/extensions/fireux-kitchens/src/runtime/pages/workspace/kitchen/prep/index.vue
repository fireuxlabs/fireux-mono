<template>
  <KitchenGroupIndex
    nav-key="workspace-kitchen-prep"
    notice="Prep planning and batch records are not connected yet."
  ></KitchenGroupIndex>
</template>
<script setup lang="ts">
import KitchenGroupIndex from '../../../../kitchen/components/Workspace/GroupIndex.vue'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-prep',
    label: 'Prep & Production',
    description:
      'Organise preparation, stations and batch records. Recipe definitions stay in Menus & Recipes.',
    groupIndex: true,
    icon: 'i-lucide-cooking-pot',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Prep plan',
        to: '/workspace/kitchen/prep/plan',
        icon: 'i-lucide-clipboard-list',
      },
      { label: 'Stations', to: '/workspace/kitchen/stations' },
      { label: 'Batches', to: '/workspace/kitchen/prep/batches' },
    ],
  },
})
</script>
