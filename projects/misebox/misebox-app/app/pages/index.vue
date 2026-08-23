<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen" />
      </template>

      <template #body>
        <WorkspaceKitchen />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
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
