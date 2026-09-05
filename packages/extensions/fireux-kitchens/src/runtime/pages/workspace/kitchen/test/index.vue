<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header
      ><LayoutsWorkspaceNavbar title="Test"
        ><template #right
          ><WorkspaceTestInfo
            :state="state"
            :derived="derived" /></template></LayoutsWorkspaceNavbar
    ></template>
    <template #body>
      <WorkspaceTestSelector
        entity-label="Kitchen"
        :state="state"
        :derived="derived"
        :primitives="primitives"
        :natives="natives"
      />
      <WorkspaceFreemium
        family="kitchen"
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
      <WorkspaceTestAI entity-label="Kitchen" :derived="derived" />

      <WorkspaceTest
        entity-label="Kitchen"
        route-base="/workspace/kitchen/test"
        :state="state"
        :derived="derived"
        :primitives="primitives"
      />
      <WorkspaceTestDiscovery entity-label="Kitchen" />
      <WorkspaceFreemium
        family="kitchen"
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
