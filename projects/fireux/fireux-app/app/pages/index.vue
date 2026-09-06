<template>
  <UDashboardPanel id="workspace-project-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceProject :publication="appContext.publication.value" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'
import { useProjectAppContext } from 'fireux-fireux/runtime/project/composables/workspace/identity/useProjectAppContext'
const appContext = useProjectAppContext()
const intro = {
  title: 'Project Workspace',
  purpose: 'Choose a project on the left and work on it on the right.',
  data: 'Your available projects and the selected workspace.',
  boundaries:
    'Creation follows your workspace allowance. Selection does not change ownership or permissions.',
  ai: 'This page uses direct workspace controls.',
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
