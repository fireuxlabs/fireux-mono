<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: keep the create route thin. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-blank-create">
      <template #header>
        <WorkspaceNavbar title="Create Blank" />
      </template>

      <template #body>
        <section class="space-y-4">
          <BlankCreateSystem />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import BlankCreateSystem from '../../../components/Blank/Create/System.vue'

definePageMeta({
  layout: 'workspace',
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
