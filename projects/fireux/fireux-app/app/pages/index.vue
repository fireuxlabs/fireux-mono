<template>
  <UDashboardPanel id="workspace-project-index">
    <WorkspaceProjectNav :state="state" :derived="derived" />
    <WorkspaceProject
      :state="state"
      :derived="derived"
      :refresh="actions.refresh"
    />
    <WorkspaceHero
      title="Build your Project Workspace"
      description="Build and operate your Project from one Workspace."
    />
    <WorkspaceProjectIndexAI
      :workspace-state="state"
      :workspace-derived="derived"
    />
    <WorkspaceProjectOperations />
    <WorkspaceProjectTools :state="state" :derived="derived" />
    <WorkspaceProjectDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceIndex } from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'
import { appMeta } from '~/meta'

const { state, derived, actions } = useProjectWorkspaceIndex()

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
