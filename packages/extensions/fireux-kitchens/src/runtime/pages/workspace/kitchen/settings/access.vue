<template>
  <KitchenSettingsAccess />
</template>
<script setup lang="ts">
import KitchenSettingsAccess from '../../../../kitchen/components/Settings/Access.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
