<template>
  <UDashboardPanel id="buenohost-property-home">
    <LayoutsWorkspaceNavbar title="Property Workspace" />
    <WorkspaceHero
      title="Build your Property Workspace"
      description="Manage reservations, guest information and property operations."
    />
    <WorkspaceProperty :state="state" :derived="derived" />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePropertyWorkspaceIndex } from 'fireux-properties/runtime/property/composables/workspace/index/usePropertyWorkspaceIndex'

const { state, derived } = usePropertyWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'property',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-property',
    label: 'Property',
    description: 'Property Workspace',
    icon: 'i-lucide-house',
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
  title: 'BuenoHost',
  description:
    'Publish digital guest guides and manage properties, reservations, and stay information from the Property Workspace.',
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
