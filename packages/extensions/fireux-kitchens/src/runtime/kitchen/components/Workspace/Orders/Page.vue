<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-orders">
      <template #header>
        <LayoutsWorkspaceNavbar title="Order drafts" />
      </template>
      <template #body>
        <WorkspaceKitchenOrders />
      </template>
    </UDashboardPanel>
  </div>
</template>
