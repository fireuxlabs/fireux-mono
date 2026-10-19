<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-overview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Overview"
          ><template #right><WorkspaceIntroInfo :intro="intro" /></template
        ></LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="kitchen"
          capability="overview"
          page-label="Overview"
          placement="top"
          hide-description
        />
        <section class="space-y-4">
          <WorkspaceKitchenOverview @state="pageState.publish" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
const pageState = useWorkspacePageState('kitchen')
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
const intro = {
  title: 'Kitchen Overview',
  purpose: 'Open a working area for the selected Kitchen.',
  data: 'Selected Kitchen identity and available navigation groups.',
  boundaries:
    'Setup links open their owning capability. This page does not change records.',
  ai: 'No AI actions are connected to this surface.',
}
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-overview',
    label: 'Overview',
    group: '',
    icon: 'i-lucide-layout-dashboard',
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
