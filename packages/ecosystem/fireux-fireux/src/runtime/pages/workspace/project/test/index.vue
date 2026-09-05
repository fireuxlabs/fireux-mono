<template>
  <UDashboardPanel id="workspace-project-test">
    <template #header>
      <LayoutsWorkspaceNavbar title="Test"
        ><template #right
          ><WorkspaceTestInfo :state="state" :derived="derived" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceTestSelector
        entity-label="Project"
        :state="state"
        :derived="derived"
        :primitives="primitives"
        :natives="natives"
      />
      <WorkspaceFreemium
        family="project"
        capability="test"
        :used-count="
          ['ready', 'empty'].includes(derived.status)
            ? state.tests.length
            : undefined
        "
        page-label="Test"
        placement="top"
      />
      <WorkspaceHero
        :title="testCapabilityDescription.title"
        :description="testCapabilityDescription.purpose"
      />
      <WorkspaceTestAI entity-label="Project" :derived="derived" />

      <WorkspaceTest
        entity-label="Project"
        route-base="/workspace/project/test"
        :state="state"
        :derived="derived"
        :primitives="primitives"
      />
      <WorkspaceTestDiscovery entity-label="Project" />
      <WorkspaceFreemium
        family="project"
        capability="test"
        :used-count="
          ['ready', 'empty'].includes(derived.status)
            ? state.tests.length
            : undefined
        "
        page-label="Test"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import { testCapabilityDescription } from 'fireux-core/runtime/composables/fireux/workspace/useTestAI'
import WorkspaceTestInfo from 'fireux-core/runtime/components/Workspace/Test/Info.vue'
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
