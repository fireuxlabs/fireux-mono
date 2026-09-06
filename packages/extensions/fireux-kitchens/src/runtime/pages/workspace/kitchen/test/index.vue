<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header
      ><LayoutsWorkspaceNavbar title="Test"
        ><template #right
          ><WorkspaceTestInfo
            :context="context" /></template></LayoutsWorkspaceNavbar
    ></template>
    <template #body>
      <div class="flex items-start justify-between gap-3">
        <WorkspaceTestSelector
          class="min-w-0 flex-1"
          entity-label="Kitchen"
          :state="state"
          :derived="derived"
          :primitives="primitives"
          :natives="natives"
        />
        <WorkspaceFreemium
          beside-selector
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
      </div>
      <WorkspaceHero
        compact
        :title="testCapabilityDescription.title"
        :description="testCapabilityDescription.purpose"
      />
      <WorkspaceTestAI
        entity-label="Kitchen"
        :derived="derived"
        :selected-id="state.selectedTestId"
        :request="requestAI"
        @action="testView?.openAction($event)"
      />

      <WorkspaceTest
        ref="testView"
        entity-label="Kitchen"
        route-base="/workspace/kitchen/test"
        :state="state"
        :derived="derived"
        :primitives="primitives"
        :natives="natives"
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
import { ref } from 'vue'
import WorkspaceTest from 'fireux-core/runtime/components/Workspace/Test/Index.vue'
const testView = ref<InstanceType<typeof WorkspaceTest>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import { testCapabilityDescription } from 'fireux-core/runtime/composables/fireux/useTestAI'
import WorkspaceTestInfo from 'fireux-core/runtime/components/Workspace/Test/Info.vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenTest } from '../../../../kitchen/composables/useKitchenTest'
const { state, derived, primitives, natives, context, requestAI } =
  useKitchenTest()
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
