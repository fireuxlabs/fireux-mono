<template>
  <UDashboardPanel id="misebox-kitchen-home">
    <LayoutsWorkspaceNavbar title="Kitchen Workspace">
      <template
        v-if="derived.outcome === 'pending' || derived.hasSelection"
        #title
      >
        <WorkspaceKitchenActive :kitchen="state.kitchen" />
      </template>
      <template #right>
        <!-- 07 Info — LAST: explain how the completed page, context, capabilities and boundaries fit together. -->
        <WorkspaceKitchenInfo />
      </template>
    </LayoutsWorkspaceNavbar>
    <!-- 03 Workspace — select the active Kitchen or create one when the subscription permits. -->
    <WorkspaceKitchen
      :state="state"
      :derived="derived"
      :refresh="actions.refresh"
    />
    <!-- 01 Hero — define the Kitchen page promise, audience and intended outcome. -->
    <WorkspaceKitchenHero />
    <!-- 02 AI — provide the page-scoped KitchenAI entry with only the context and actions this page proves. -->
    <WorkspaceKitchenIndexAI
      :workspace-state="state"
      :workspace-derived="derived"
    />
    <!-- 04 Operations — curate only the main Kitchen index Operations; capability pages own WorkspaceKitchenXOperations. -->
    <WorkspaceKitchenOperations />
    <!-- 05 Tools — expose only bounded Tools beneath the featured capabilities; capability pages own WorkspaceKitchenXTools. -->
    <WorkspaceKitchenTools :state="state" :derived="derived" />
    <!-- 06 Discovery — publish demand-led literature and SEO for this exact index; capability pages own WorkspaceKitchenXDiscovery. -->
    <WorkspaceKitchenDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'
import { appMeta } from '../meta'

const { state, derived, actions } = useKitchenWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
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
