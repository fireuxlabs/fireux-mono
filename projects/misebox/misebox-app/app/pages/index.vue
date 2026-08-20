<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen AI" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenTools />
          <WorkspaceKitchenAIWelcome />
          <WorkspaceKitchen v-if="clientReady && isAuthenticated" />
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

const { isAuthenticated } = useAuth()
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
    key: 'home',
    label: 'Kitchen AI',
    icon: 'i-lucide-sparkles',
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
