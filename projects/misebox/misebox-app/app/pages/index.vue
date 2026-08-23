<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen AI" />
      </template>

      <template #body>
        <section class="workspace-surface">
          tools
          <WorkspaceKitchenTools />
          AI
          <WorkspaceKitchenAI />
          <template v-if="clientReady && hasIdentity">
            index
            <WorkspaceKitchen :show-debug="false" />
          </template>
          <template v-if="isDevelopment">
            <USeparator label="Development" class="my-2" />
            <WorkspaceKitchenDev />
          </template>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

const { hasIdentity } = useAuth()
const isDevelopment = import.meta.dev
const workspaceRoot = useWorkspace()
workspaceRoot.setActiveContext('kitchen')
const clientReady = ref(false)
onMounted(() => {
  clientReady.value = true
})

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
