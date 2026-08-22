<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-costs">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Costs" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityView operation="costs" />
          <UAlert
            color="neutral"
            variant="soft"
            title="Cost evidence is derived"
            description="This doorway does not claim profit or accounting measures. Cost reporting becomes available only from authoritative Recipe, Ingredient, purchase-price, and activity records."
          />
          <WorkspaceKitchenOperationsGuidingLiterature operation="costs" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-costs',
    label: 'Costs',
    group: 'Reports',
    icon: 'i-lucide-calculator',
    position: 'top',
    order: 41,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
