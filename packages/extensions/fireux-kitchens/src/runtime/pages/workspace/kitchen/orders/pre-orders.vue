<!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order workspace route: add the focused operator confirmation doorway. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-pre-orders">
      <template #header>
        <LayoutsWorkspaceNavbar title="Pre-orders">
          <template #right>
            <UButton
              to="/workspace/kitchen/orders"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              label="Orders"
            />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceKitchenOrdersPreOrders />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'live',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
