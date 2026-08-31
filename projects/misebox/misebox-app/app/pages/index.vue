<template>
  <UDashboardPanel id="misebox-kitchen-home">
    <WorkspaceKitchenNav :state="state" :derived="derived" />
    <WorkspaceKitchen
      :state="state"
      :derived="derived"
      :refresh="actions.refresh"
    />
    <WorkspaceKitchenHero />
    <WorkspaceKitchenIndexAI
      :workspace-state="state"
      :workspace-derived="derived"
    />
    <WorkspaceKitchenOperations />
    <WorkspaceKitchenTools :state="state" :derived="derived" />
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
