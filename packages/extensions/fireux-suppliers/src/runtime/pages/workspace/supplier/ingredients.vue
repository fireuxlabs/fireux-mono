<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-ingredients">
      <template #header>
        <LayoutsWorkspaceNavbar title="Supplier Ingredients">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Supplier Ingredients" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceSupplierOperationsIngredients />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-wheat',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
