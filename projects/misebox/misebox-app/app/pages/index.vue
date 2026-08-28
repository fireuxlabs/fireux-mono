<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Workspace" :show-title="false">
          <template #right>
            <MiseboxWorkspaceKitchenMainInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <MiseboxWorkspaceKitchenMain />
        <div class="workspace-surface grid gap-6">
          <MiseboxWorkspaceKitchenOperations />
          <MiseboxWorkspaceKitchenTools />
          <MiseboxWorkspaceKitchenDiscovery />
        </div>
      </template>
    </UDashboardPanel>
  </div>
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
