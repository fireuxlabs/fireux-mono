<template>
  <UDashboardPanel id="workspace-project-test">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <WorkspaceTestSelector
        entity-label="Project"
        :state="state"
        :derived="derived"
        :primitives="primitives"
        :natives="natives"
      />
      <WorkspaceHero
        title="Build your Project Tests"
        description="Create and manage simple String values inside this Project."
      />
      <WorkspaceTestAI entity-label="Project" :derived="derived" />
      <WorkspaceTest
        entity-label="Project"
        route-base="/workspace/project/test"
        :state="state"
        :derived="derived"
        :primitives="primitives"
      />
      <WorkspaceProjectOperations />
      <WorkspaceTestDiscovery entity-label="Project" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

const { state, derived, primitives, natives } = useProjectWorkspaceTest()
const { appName } = useFireUXConfig()

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
  title: `Test | ${appName}`,
  description: 'Create and manage simple String values inside this Project.',
  path: '/workspace/project/test',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
