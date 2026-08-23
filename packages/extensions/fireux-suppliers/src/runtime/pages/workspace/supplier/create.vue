<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-supplier-create">
      <template #header>
        <LayoutsWorkspaceNavbar title="Create Supplier" />
      </template>

      <template #body>
        <section class="space-y-4">
          <SupplierCreateSystem
            v-if="canCreate"
            mode="workspace"
            return-to="/workspace/supplier"
            cancel-to="/workspace/supplier"
          />

          <UPageCard
            v-else
            title="Supplier creation is not enabled here"
            description="This app uses existing Supplier workspace targets."
            variant="subtle"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const canCreate = true

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    hidden: true,
    order: 5,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
