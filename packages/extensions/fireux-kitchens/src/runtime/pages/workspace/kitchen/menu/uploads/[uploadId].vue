<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.menu.menus"
    label="Menu sources"
    context-label="Menu"
  />
  <section class="fx-page-stack">
    <KitchenWorkspaceMenuMenusUploadsDetail />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-menu-source-detail',
    label: 'Review menu import',
    icon: 'i-lucide-file-search',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})
</script>
