<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-identity">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Identity" />
      </template>

      <template #body>
        <WorkspaceFreemium
          family="project"
          capability="identity"
          page-label="Identity"
          placement="top"
        />
        <section class="space-y-4">
          <WorkspaceProjectIdentity />
        </section>
        <WorkspaceFreemium
          family="project"
          capability="identity"
          page-label="Identity"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
