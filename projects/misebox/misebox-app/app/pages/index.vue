<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar :title="pageTitle" :show-title="false">
          <template #right>
            <MiseboxWorkspaceKitchenContextInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <MiseboxHome />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { appMeta } from '../meta'

const kitchenWorkspace = useWorkspace('kitchen')
const pageTitle = computed(
  () => kitchenWorkspace.activeName.value || 'Kitchen Workspace'
)
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
