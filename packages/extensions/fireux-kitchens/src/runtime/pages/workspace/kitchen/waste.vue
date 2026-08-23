<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-waste">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Waste" />
      </template>

      <template #body>
        <section class="workspace-surface">
          tools
          <WorkspaceKitchenWasteTools />
          AI
          <WorkspaceKitchenWasteAI />
          Index
          <WorkspaceKitchenWaste v-if="clientReady && isAuthenticated" />
          dev
          <WorkspaceKitchenWasteDev v-if="isDevelopment" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()
const isDevelopment = import.meta.dev
const clientReady = ref(false)
onMounted(() => {
  clientReady.value = true
})

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-waste',
    label: 'Waste',
    group: 'Operations',
    icon: 'i-lucide-trash-2',
    position: 'top',
    order: 26,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
