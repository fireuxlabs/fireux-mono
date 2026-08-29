<template>
  <UDashboardPanel id="fireux-project-home">
    <LayoutsWorkspaceNavbar title="Project Workspace">
      <!-- 07 Info — LAST: explain how the completed page, context, capabilities and boundaries fit together. -->
      <WorkspaceProjectInfo />
    </LayoutsWorkspaceNavbar>
    <!-- 01 Hero — define the Project page promise, audience and intended outcome. -->
    <WorkspaceProjectHero />
    <!-- 02 AI — provide the page-scoped ProjectAI entry with only the context and actions this page proves. -->
    <WorkspaceProjectAI />
    <!-- 03 Workspace — prove Project state, selection, empty state and primary actions. -->
    <WorkspaceProject />
    <!-- 04 Operations — curate only the main Project index Operations; capability pages own WorkspaceProjectXOperations. -->
    <WorkspaceProjectOperations />
    <!-- 05 Tools — expose only bounded Tools beneath the featured capabilities; capability pages own WorkspaceProjectXTools. -->
    <WorkspaceProjectTools />
    <!-- 06 Discovery — publish demand-led literature and SEO for this exact index; capability pages own WorkspaceProjectXDiscovery. -->
    <WorkspaceProjectDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Current Project',
    description: 'My Project',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
