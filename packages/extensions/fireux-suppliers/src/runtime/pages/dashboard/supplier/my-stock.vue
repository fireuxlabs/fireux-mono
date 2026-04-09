<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/my-stock.vue -->
<template>
  <UDashboardPanel id="console-supplier-my-stock">
    <template #header>
      <LayoutsDashboardNavbar title="My Stock" />
    </template>

    <template #body>
      <div class="panels-stack">
        <section class="space-y-6">
          <UAlert
            icon="i-lucide-box"
            color="neutral"
            title="My Stock"
            description="Inventory, restock alerts, and analytics will eventually surface here."
          />

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
              <template #header>
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-activity" />
                  Stock overview
                </div>
              </template>
              <p class="text-sm text-muted">
                Placeholder content. Replace with supply chain data when the API is
                ready.
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-sparkles" />
                  Quick actions
                </div>
              </template>
              <div class="space-y-2">
                <UButton
                  to="/dashboard/supplier/manage"
                  label="Update supplier"
                  color="neutral"
                  block
                />
                <UButton
                  to="/dashboard/supplier"
                  label="Back to overview"
                  variant="soft"
                  color="neutral"
                  block
                />
              </div>
            </UCard>
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-stock',
    label: 'My Stock',
    icon: 'i-lucide-box',
    desktop: false,
    mobile: false,
  },
  requiresAuth: true,
})
</script>
