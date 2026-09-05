<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <WorkspaceKitchenNav />
    </template>
    <template #body>
      <WorkspaceKitchenSelector />
      <WorkspaceHero
        title="Build your Kitchen Workspace"
        description="Build and operate your Kitchen from one Workspace."
      />
      <WorkspaceKitchenIndexAI />
      <WorkspaceKitchen />
      <WorkspaceKitchenCapabilities />
      <WorkspaceKitchenDiscovery />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '~/meta'

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
