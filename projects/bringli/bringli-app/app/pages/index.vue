<template>
  <UDashboardPanel id="bringli-supplier-home">
    <LayoutsWorkspaceNavbar title="Supplier Workspace" />
    <WorkspaceHero
      title="Build your Supplier Workspace"
      description="Manage catalogues, ingredients and supply operations."
    />
    <WorkspaceSupplier />
    <WorkspaceSupplierTools />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'


definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'supplier',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-supplier',
    label: 'Supplier',
    description: 'Supplier Workspace',
    icon: 'i-lucide-truck',
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
