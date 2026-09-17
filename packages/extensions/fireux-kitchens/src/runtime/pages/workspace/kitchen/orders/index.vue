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
        <WorkspaceKitchenOrders v-if="hasKitchen" :view="view" />
        <UAlert
          v-else
          title="Choose a kitchen to see orders"
          :actions="[{ label: 'Choose Kitchen', to: workspaceEntryPath }]"
        />
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
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')

const route = useRoute()
const view = computed(() =>
  route.query.view === 'queue'
    ? 'queue'
    : route.query.view === 'pass'
      ? 'pass'
      : 'all'
)
const title = computed(() =>
  view.value === 'queue'
    ? 'Kitchen queue'
    : view.value === 'pass'
      ? 'Pass & handoff'
      : 'All orders'
)
const kitchenWorkspace = useWorkspace('kitchen')
const hasKitchen = computed(() => Boolean(kitchenWorkspace.selectedId.value))

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-orders',
    label: 'Orders & Service',
    group: '',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'All orders', to: '/workspace/kitchen/orders' },
      { label: 'Kitchen queue', to: '/workspace/kitchen/orders?view=queue' },
      { label: 'Pass & handoff', to: '/workspace/kitchen/orders?view=pass' },
      { label: 'Tables', to: '/workspace/kitchen/tables' },
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
