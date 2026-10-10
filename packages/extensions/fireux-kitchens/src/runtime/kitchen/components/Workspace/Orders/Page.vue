<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-orders">
      <template #header>
        <LayoutsWorkspaceNavbar title="Orders &amp; Service"
          ><template #right><div id="kitchen-orders-actions" /></template
        ></LayoutsWorkspaceNavbar>
      </template>
      <template #body>
        <UPageHeader
          :title="title"
          description="Follow orders from arrival to kitchen handoff."
        />
        <WorkspaceKitchenOrders :view="view" />
        <MoleculesDisclosurePanel
          title="Orders reference"
          icon="i-lucide-info"
          :default-open="false"
        >
          <WorkspaceKitchenTools capability="orders" />
          <WorkspaceKitchenAICapability capability="orders" />
          <WorkspaceKitchenResearchCapabilitySummary capability="orders" />
          <WorkspaceKitchenOrdersKioskDoorway />
          <WorkspaceKitchenResearchGuide capability="orders" />
          <WorkspaceKitchenResearchSegue
            capability="Orders &amp; Service"
            base-path="/workspace/kitchen/orders/search-demand"
          />
        </MoleculesDisclosurePanel>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ view?: 'all' | 'queue' | 'pass' }>(), {
  view: 'all',
})
const view = computed(() => props.view)

const title = computed(() =>
  view.value === 'queue'
    ? 'Kitchen queue'
    : view.value === 'pass'
      ? 'Pass & handoff'
      : 'All orders'
)
</script>
