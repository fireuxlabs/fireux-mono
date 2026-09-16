<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right
          ><WorkspaceIntroInfo
            :intro="intro"
            workspace="kitchen"
            :show-structured-details="false" /></template
      ></LayoutsWorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"
        ><WorkspaceKitchenSelector
      /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceKitchenHomeAI :perform-action="performLandingAction" />
      <WorkspaceKitchen ref="workspaceSurface" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useSeoMeta } from '#imports'
import { computed, ref } from 'vue'
import WorkspaceKitchen from 'fireux-kitchens/runtime/kitchen/components/Workspace/Index.vue'
const workspaceSurface = ref<InstanceType<typeof WorkspaceKitchen> | null>(null)
import type { KitchenLandingIntent } from 'fireux-kitchens/runtime/kitchen/models/landing-intent'
const performLandingAction = (intent: KitchenLandingIntent) =>
  workspaceSurface.value?.performAction(intent) ?? false
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { kitchenWorkspaceIntro } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-workspace-intro'
const { state: pageState } = useWorkspacePageState('kitchen')
const intro = computed(
  () =>
    (pageState.value?.intro as WorkspaceIntro | undefined) ??
    kitchenWorkspaceIntro()
)
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Kitchen',
    group: 'Workspace',
    description: 'Kitchen Workspace',
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

useSeoMeta({
  title: 'Kitchen Workspace | Misebox',
  robots: 'noindex, nofollow',
})
</script>
