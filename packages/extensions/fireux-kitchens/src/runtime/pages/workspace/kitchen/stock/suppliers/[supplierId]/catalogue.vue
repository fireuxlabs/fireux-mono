<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-supplier-catalogue">
      <template #header>
        <LayoutsWorkspaceNavbar title="Supplier Catalogue" />
      </template>

      <template #body>
        <section class="space-y-4">
          <KitchenSuppliersCatalogue />
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
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-supplier-catalogue',
    label: 'Supplier Catalogue',
    icon: 'i-lucide-book-open',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
