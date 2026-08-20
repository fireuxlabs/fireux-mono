<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-blank-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Blank Workspace" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceBlankIndex />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-blank',
    label: 'Blank',
    icon: 'i-lucide-square-dashed',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
