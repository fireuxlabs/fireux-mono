<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-my-jobs">
    <template #header>
      <UDashboardNavbar title="My Jobs">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          icon="i-lucide-briefcase"
          color="neutral"
          title="My Jobs"
          description="Track saved, drafted, and published jobs here."
        />

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div
                class="flex items-center gap-2 text-sm uppercase tracking-wide text-dimmed"
              >
                <UIcon name="i-lucide-clipboard-list" />
                Drafts
              </div>
            </template>
            <p class="text-sm text-muted">
              Drafted jobs will appear here once the data source is wired up.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <div
                class="flex items-center gap-2 text-sm uppercase tracking-wide text-dimmed"
              >
                <UIcon name="i-lucide-send" />
                Published
              </div>
            </template>
            <p class="text-sm text-muted">
              Published jobs will display here after integration.
            </p>
          </UCard>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
})
</script>
