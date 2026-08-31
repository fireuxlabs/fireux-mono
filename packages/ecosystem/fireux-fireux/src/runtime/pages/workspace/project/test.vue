<template>
  <UDashboardPanel id="workspace-project-test">
    <WorkspaceProjectNav :state="state" :derived="derived" />
    <WorkspaceProjectTestSelector
      :state="state"
      :derived="derived"
      :actions="actions"
    />
    <WorkspaceHero
      title="Build your Project Tests"
      description="Create and manage simple named objects inside this Project."
    />
    <WorkspaceProjectTestAI />
    <WorkspaceProjectTest
      :state="state"
      :derived="derived"
      :actions="actions"
    />
    <WorkspaceProjectTestTools :state="state" :actions="actions" />
    <WorkspaceProjectTestDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTest } from '../../../project/composables/workspace/test/useProjectWorkspaceTest'
import { appMeta } from '~/meta'

const { state, derived, actions } = useProjectWorkspaceTest()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-test',
    label: 'Test',
    group: 'Workspace',
    description: 'Project Test',
    icon: 'i-lucide-flask-conical',
    position: 'top',
    order: 7,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

useAppLandingSeo({
  title: `Test | ${appMeta.name}`,
  description: 'Create and manage simple named objects inside this Project.',
  path: '/workspace/project/test',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
