<template>
  <UDashboardPanel id="misebox-kitchen-home">
    <LayoutsWorkspaceNavbar title="Kitchen Workspace">
      <!-- 07 Info — LAST: explain how the completed page, context, capabilities and boundaries fit together. -->
      <WorkspaceKitchenInfo />
    </LayoutsWorkspaceNavbar>
    <!-- 01 Hero — define the Kitchen page promise, audience and intended outcome. -->
    <WorkspaceKitchenHero />
    <!-- 02 AI — provide the page-scoped KitchenAI entry with only the context and actions this page proves. -->
    <WorkspaceKitchenAI />
    <!-- 03 Workspace — prove Kitchen state, selection, empty state and primary actions. -->
    <WorkspaceKitchen />
    <!-- 04 Operations — curate only the main Kitchen index Operations; capability pages own WorkspaceKitchenXOperations. -->
    <WorkspaceKitchenOperations />
    <!-- 05 Tools — expose only bounded Tools beneath the featured capabilities; capability pages own WorkspaceKitchenXTools. -->
    <WorkspaceKitchenTools />
    <!-- 06 Discovery — publish demand-led literature and SEO for this exact index; capability pages own WorkspaceKitchenXDiscovery. -->
    <WorkspaceKitchenDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  nav: {
    key: 'workspace-kitchen',
    label: 'Current Kitchen',
    description: 'My Kitchen',
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
