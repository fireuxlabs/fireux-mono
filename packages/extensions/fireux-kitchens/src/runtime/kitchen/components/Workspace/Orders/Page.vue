<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-orders">
      <template #header>
        <LayoutsWorkspaceNavbar title="Orders"
          ><template #right><div id="kitchen-orders-actions" /></template
        ></LayoutsWorkspaceNavbar>
      </template>
      <template #body>
        <div class="space-y-2">
          <h2 class="text-xl font-semibold text-highlighted">Order board</h2>
          <p class="text-sm text-muted">
            Follow orders from arrival to Kitchen handoff.
          </p>
        </div>
        <WorkspaceKitchenOrders />
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
