<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-create">
      <template #header>
        <LayoutsWorkspaceNavbar title="Create Portfolio" />
      </template>

      <template #body>
        <section class="space-y-4">
          <PortfolioCreateSystem
            v-if="canCreate"
            mode="workspace"
            return-to="/workspace/portfolio"
            cancel-to="/workspace/portfolio"
          />

          <UPageCard
            v-else
            title="Portfolio creation is not enabled here"
            description="This app uses existing Portfolio workspace targets."
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
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-create',
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
