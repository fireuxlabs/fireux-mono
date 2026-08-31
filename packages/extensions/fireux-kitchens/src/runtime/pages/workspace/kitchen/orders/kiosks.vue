<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-kiosks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kiosks">
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
        <WorkspaceKitchenOrdersKiosks />
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
