<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-ecosystem">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Ecosystem" />
      </template>

      <template #body>
        <section class="space-y-6">
          <WorkspaceProjectEcosystem />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-ecosystem',
    label: 'Ecosystem',
    icon: 'i-lucide-orbit',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
