<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: keep the create route thin. -->
<template>
  <UDashboardPanel id="console-blank-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Blank" />
    </template>

    <template #body>
      <section class="space-y-4">
        <BlankCreateSystem />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import BlankCreateSystem from '../../../components/Blank/Create/System.vue'

definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  name: 'BlankConsoleCreatePage',
  nav: {
    key: 'console-blank-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})

useSeoMeta({
  title: 'Create Blank',
  description: 'Create a Blank console target.',
  robots: 'noindex, nofollow',
})
</script>
