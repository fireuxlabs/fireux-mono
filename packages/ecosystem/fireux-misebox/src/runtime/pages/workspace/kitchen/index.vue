<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-workspace">
      <template #header>
        <LayoutsWorkspaceNavbar
          title="Kitchen Workspace"
          :show-title="false"
        />
      </template>

      <template #body>
        <MiseboxWorkspaceKitchenMain />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
})
</script>
