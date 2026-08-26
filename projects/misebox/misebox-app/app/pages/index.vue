<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar :title="pageTitle">
          <template #right>
            <MiseboxWorkspaceKitchenContextInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <div>{{ user?.ping }}</div>
        <section class="workspace-surface">
          <WorkspaceKitchenTools />
          <main class="workspace-surface__primary">
            <WorkspaceKitchenAI
              title="What would you like to work on?"
              agent-label=""
              :starters="[]"
            />
          </main>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { appMeta } from '../meta'

const { currentUser: user } = useUser()
const kitchenWorkspace = useWorkspace('kitchen')
const pageTitle = computed(
  () => kitchenWorkspace.currentName.value || 'Kitchen Workspace'
)

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
