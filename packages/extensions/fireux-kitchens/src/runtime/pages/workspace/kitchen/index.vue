<template>
  <UDashboardToolbar
    v-if="!fireux.isTenant || ready"
    :ui="{ root: 'border-b-0' }"
  >
    <WorkspaceKitchenSelector />
  </UDashboardToolbar>
  <div class="flex items-center gap-3">
    <div v-if="fireux.isTenant" class="shrink-0 rounded-lg bg-white p-2">
      <AppBrandLogo size="small" />
    </div>
    <UPageHeader :title="workspaceTitle" />
  </div>
  <WorkspaceKitchenHomeAI
    v-if="!fireux.isTenant || ready"
    :perform-action="performLandingAction"
  />
  <nav
    v-if="fireux.isTenant && ready"
    class="flex flex-wrap gap-2"
    aria-label="Kitchen actions"
  >
    <UButton
      to="/workspace/kitchen/food-and-drink/menus"
      label="Menus"
      icon="i-lucide-notebook-text"
    />
    <UButton
      to="/workspace/kitchen/team"
      label="Team"
      icon="i-lucide-users"
      color="neutral"
      variant="soft"
    />
    <UButton
      to="/workspace/kitchen/food-and-drink/services"
      label="Services"
      icon="i-lucide-layout-dashboard"
      color="neutral"
      variant="ghost"
    />
  </nav>
  <WorkspaceKitchen
    ref="workspaceSurface"
    :dedicated-app-name="fireux.isTenant ? fireux.appName : undefined"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import WorkspaceKitchen from '../../../kitchen/components/Workspace/Index.vue'
const fireux = useFireUXConfig()
const { state } = useWorkspacePageState('kitchen')
const ready = computed(() => state.value?.derived?.landingState === 'ready')
const workspaceTitle = computed(() =>
  fireux.isTenant ? fireux.appName : 'Kitchen Workspace'
)
const workspaceSurface = ref<InstanceType<typeof WorkspaceKitchen> | null>(null)
import type { KitchenLandingIntent } from '../../../kitchen/models/landing-intent'
const performLandingAction = (intent: KitchenLandingIntent) =>
  workspaceSurface.value?.performAction(intent) ?? false
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
