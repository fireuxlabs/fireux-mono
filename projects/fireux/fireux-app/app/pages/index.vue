<template>
  <UDashboardPanel id="workspace-project-index">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <WorkspaceProjectSelector />
      <WorkspaceHero
        title="Build your Project Workspace"
        description="Build and operate your Project from one Workspace."
      />
      <WorkspaceProject />
      <WorkspaceProjectCapabilities />
      <WorkspaceProjectDiscovery />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'

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
