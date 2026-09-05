<template>
  <UDashboardPanel id="workspace-project-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceProjectSelector />
      <WorkspaceFreemium
        family="project"
        capability="landing"
        page-label="Workspace"
        placement="top"
      />
      <WorkspaceHero :title="intro.title" :description="intro.purpose" />
      <WorkspaceProjectIndexAI />

      <WorkspaceProject />
      <WorkspaceProjectCapabilities />
      <WorkspaceProjectDiscovery />
      <WorkspaceFreemium
        family="project"
        capability="landing"
        page-label="Workspace"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'

const intro = {
  title: 'Project Workspace',
  purpose: 'Create, choose and manage your project workspaces.',
  data: 'Workspace identities and your current selection.',
  boundaries:
    'Creation follows your workspace allowance. Selection does not change ownership or permissions.',
  ai: 'Draft a prompt or choose a suggestion. Sending is not connected on this landing yet.',
}

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Project',
    group: 'Workspace',
    description: 'Project Workspace',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
