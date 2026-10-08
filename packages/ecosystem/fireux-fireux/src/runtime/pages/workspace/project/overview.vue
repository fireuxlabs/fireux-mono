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
          <WorkspaceProjectOverview :publication="published.publication.value">
            <WorkspaceProjectOverviewAppContext
              v-if="published.connected.value"
              @state="appContext = $event"
            />
          </WorkspaceProjectOverview>
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
import { ref, watchEffect } from 'vue'
import { useProjectAppContext } from '../../../project/composables/workspace/identity/useProjectAppContext'
import { useProjectWorkspace } from 'fireux-fireux/runtime/project/composables/workspace/useProjectWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import WorkspaceProjectOverviewAppContext from '../../../components/Workspace/Project/Overview/AppContext.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
const workspace = useProjectWorkspace()
const published = useProjectAppContext()
const appContext = ref<unknown>(null)
const pageState = useWorkspacePageState('project')
watchEffect(() => {
  const project = workspace.data.value
  pageState.publish({
    project: project
      ? {
          id: workspace.id.value,
          name: project.identity.name,
          description: published.publication.value
            ? published.publication.value.description
            : project.identity.description,
          image_url: published.publication.value
            ? published.publication.value.imageUrl
            : project.identity.image_url,
          source: published.publication.value,
        }
      : null,
    appContext: appContext.value,
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
