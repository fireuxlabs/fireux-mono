<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <UPageHeader title="Blank Overview" description="Blank workspace overview." />
  <WorkspaceBlankSelector />
  <WorkspaceAI compact aria-label="Blank Overview AI"
    ><UAlert title="Overview AI is not connected yet" color="neutral" />
  </WorkspaceAI>
  <section class="space-y-4">
    <WorkspaceBlankOverview />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-blank-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
