<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-overview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Overview"
          ><template #right><WorkspaceIntroInfo :intro="intro" /></template
        ></LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="project"
          capability="overview"
          page-label="Overview"
          placement="top"
        />
        <section class="space-y-4">
          <WorkspaceProjectOverview />
        </section>
        <WorkspaceFreemium
          family="project"
          capability="overview"
          page-label="Overview"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
const intro = {
  title: 'Project Overview',
  purpose: 'Review the selected workspace and its setup needs.',
  data: 'Only the selected workspace identity and available setup state.',
  boundaries:
    'Setup links open their owning capability. This page does not change records.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-overview',
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
