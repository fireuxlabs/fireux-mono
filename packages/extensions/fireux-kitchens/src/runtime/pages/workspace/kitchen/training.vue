<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-training">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Training" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UAlert color="neutral" variant="soft"
            title="Kitchen training is parked"
            description="This kitchen workspace route is intentionally hidden until the training workspace is wired."
          />
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
    key: 'workspace-kitchen-training',
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    position: 'top',
    hidden: true,
    parked: true,
    order: 84,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
