<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenTools />
          <WorkspaceKitchenAI
            title="How can I help your Kitchen today?"
            agent-label=""
            description=""
            :starters="[]"
          />
          <WorkspaceKitchen />
          <WorkspaceKitchenDev v-if="isDevelopment" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

const isDevelopment = import.meta.dev

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  nav: {
    key: 'workspace-kitchen',
    label: 'Current Kitchen',
    description: 'Click here to onboard your kitchen',
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
