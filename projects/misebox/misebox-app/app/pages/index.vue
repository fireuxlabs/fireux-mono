<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceKitchenSelector />
      <WorkspaceFreemium
        family="kitchen"
        capability="landing"
        page-label="Workspace"
        placement="top"
      />
      <WorkspaceHero :title="intro.title" :description="intro.purpose" />
      <WorkspaceKitchenIndexAI />

      <WorkspaceKitchen />
      <WorkspaceKitchenCapabilities />
      <WorkspaceKitchenDiscovery />
      <WorkspaceFreemium
        family="kitchen"
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
  title: 'Kitchen Workspace',
  purpose: 'Create, choose and manage your kitchen workspaces.',
  data: 'Workspace identities and your current selection.',
  boundaries:
    'Creation follows your workspace allowance. Selection does not change ownership or permissions.',
  ai: 'Draft a prompt or choose a suggestion. Sending is not connected on this landing yet.',
}

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
    group: 'Workspace',
    description: 'Kitchen Workspace',
    icon: 'i-lucide-chef-hat',
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
