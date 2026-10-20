<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-ingredient-add">
      <template #header>
        <LayoutsWorkspaceNavbar title="Create Kitchen Ingredient" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UBreadcrumb :items="breadcrumbItems" />
          <WorkspaceKitchenIngredientsAdd />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const breadcrumbItems = [
  {
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    to: '/workspace/kitchen/prep/ingredients',
  },
  {
    label: 'Create Ingredient',
    icon: 'i-lucide-plus',
  },
]

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-ingredient-add',
    label: 'Create Ingredient',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
