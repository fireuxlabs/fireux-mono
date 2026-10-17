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
      <UDashboardToolbar
        :ui="{ root: 'border-b-0' }"
        v-if="
          index.multipleKitchenView.value && index.collection.value.length > 1
        "
      >
        <WorkspaceKitchenSelectorChoices
          :collection="index.collection.value"
          :selected-id="index.selectedId.value"
          @select="index.select"
        />
      </UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceGuestWelcome />
      <WorkspaceKitchenHomeAI :perform-action="performLandingAction" />
      <WorkspaceKitchen ref="workspaceSurface" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceGuestWelcome from 'fireux-core/runtime/components/Workspace/GuestWelcome.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import type { WorkspaceIntro } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import WorkspaceKitchen from 'fireux-kitchens/runtime/kitchen/components/Workspace/Index.vue'
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex'
import type { KitchenLandingIntent } from 'fireux-kitchens/runtime/kitchen/models/landing-intent'
import { kitchenWorkspaceIntro } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-workspace-intro'

const index = useKitchenWorkspaceIndex()
const workspaceSurface = ref<InstanceType<typeof WorkspaceKitchen> | null>(null)
const { state: pageState } = useWorkspacePageState('kitchen')
const intro = computed(
  () =>
    (pageState.value?.intro as WorkspaceIntro | undefined) ??
    kitchenWorkspaceIntro()
)
const performLandingAction = (intent: KitchenLandingIntent) =>
  workspaceSurface.value?.performAction(intent) ?? false
</script>
