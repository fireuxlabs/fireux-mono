<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <WorkspaceKitchenNav :state="state" :derived="derived" />
    <WorkspaceKitchen
      :state="state"
      :derived="derived"
      :refresh="actions.refresh"
    />
    <WorkspaceHero
      title="Build your Kitchen Workspace"
      description="Build and operate your Kitchen from one Workspace."
    />
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
import { appMeta } from '~/meta'

const { state, derived, actions } = useKitchenWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
    group: 'Workspace',
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
