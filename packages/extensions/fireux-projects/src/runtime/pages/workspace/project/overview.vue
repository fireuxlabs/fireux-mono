<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <WorkspaceIntroInfo :intro="intro" />
  <WorkspaceFreemium
    family="project"
    capability="overview"
    page-label="Overview"
    placement="top"
  />
  <section>
    <WorkspaceProjectOverview />
  </section>
  <WorkspaceFreemium
    family="project"
    capability="overview"
    page-label="Overview"
    placement="bottom"
  />
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useProjectWorkspace } from '../../../project/composables/workspace/useProjectWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
const workspace = useProjectWorkspace()
const pageState = useWorkspacePageState('project')
watchEffect(() => {
  const project = workspace.data.value
  pageState.publish({
    project: project
      ? {
          id: workspace.id.value,
          name: project.identity.name,
          description: project.identity.description,
          image_url: project.identity.image_url,
        }
      : null,
    derived: { status: workspace.outcome.value },
  })
})
const intro = {
  title: 'Project Overview',
  purpose: 'Review the selected workspace and its setup needs.',
  data: 'Only the selected workspace identity and available setup state.',
  boundaries:
    'Setup links open their owning capability. This page does not change records.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
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
