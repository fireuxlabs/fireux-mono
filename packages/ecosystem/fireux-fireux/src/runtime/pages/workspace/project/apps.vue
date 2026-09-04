<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-apps">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Apps" />
      </template>

      <template #body>
        <section class="space-y-6">
          <WorkspaceProjectCapabilitiesApps />
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
    key: 'workspace-project-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
