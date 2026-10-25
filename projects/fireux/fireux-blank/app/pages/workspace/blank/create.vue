<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: keep the create route thin. -->
<template>
  <section class="space-y-4">
    <BlankCreateSystem />
  </section>
</template>

<script setup lang="ts">
import BlankCreateSystem from '../../../components/Blank/Create/System.vue'

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'create',
  name: 'BlankWorkspaceCreatePage',
  nav: {
    key: 'workspace-blank-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    hidden: true,
    order: 5,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})

useSeoMeta({
  title: 'Create Blank',
  description: 'Create a Blank workspace target.',
  robots: 'noindex, nofollow',
})
</script>
