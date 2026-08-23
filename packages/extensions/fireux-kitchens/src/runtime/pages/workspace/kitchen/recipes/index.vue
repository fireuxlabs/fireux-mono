<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-recipes">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Recipes" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="recipes" />
          <WorkspaceKitchenOperationsCapabilityAI operation="recipes" />
          <WorkspaceKitchenOperationsCapabilityView operation="recipes" />
          <WorkspaceKitchenOperationsRecipes />
          <WorkspaceKitchenOperationsGuidingLiterature operation="recipes" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-recipes',
    label: 'Recipes',
    group: 'Food & Drink',
    icon: 'i-lucide-notebook-tabs',
    position: 'top',
    order: 13,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
