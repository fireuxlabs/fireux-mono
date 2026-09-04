<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header><WorkspaceKitchenNav /></template>
    <template #body>
      <WorkspaceTestSelector
        entity-label="Kitchen"
        :state="state"
        :derived="derived"
        :primitives="primitives"
        :natives="natives"
      />
      <WorkspaceHero
        title="Build your Kitchen Tests"
        description="Create and manage simple String values inside this Kitchen."
      />
      <WorkspaceTestAI entity-label="Kitchen" :derived="derived" />
      <WorkspaceTest
        entity-label="Kitchen"
        route-base="/workspace/kitchen/test"
        :state="state"
        :derived="derived"
        :primitives="primitives"
      />
      <WorkspaceKitchenCapabilities />
      <WorkspaceTestDiscovery entity-label="Kitchen" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTest } from '../../../../kitchen/composables/workspace/test/useKitchenWorkspaceTest'
const { state, derived, primitives, natives } = useKitchenWorkspaceTest()
const { appName } = useFireUXConfig()
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-test',
    label: 'Test',
    group: 'Workspace',
    description: 'Kitchen Test',
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
  description: 'Create and manage simple String values inside this Kitchen.',
  path: '/workspace/kitchen/test',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
