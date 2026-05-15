<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-my-work">
    <template #header>
      <LayoutsDashboardNavbar title="My Work" />
    </template>

    <template #body>
      <div class="panels-stack">
        <section class="space-y-6">
          <UAlert
            icon="i-lucide-briefcase"
            color="neutral"
            title="My Work"
            description="Track saved jobs, applications, assigned work and availability here."
          />

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
              <template #header>
                <div
                  class="flex items-center gap-2 text-sm uppercase tracking-wide text-dimmed"
                >
                  <UIcon name="i-lucide-clipboard-list" />
                  Applications
                </div>
              </template>
              <p class="text-sm text-muted">
                Applications will appear here once the data source is wired up.
              </p>
            </UCard>

            <UCard>
              <template #header>
                <div
                  class="flex items-center gap-2 text-sm uppercase tracking-wide text-dimmed"
                >
                  <UIcon name="i-lucide-sparkles" />
                  Quick actions
                </div>
              </template>
              <div class="space-y-2">
                <UButton
                  to="/dashboard/professional/profile"
                  label="Update profile"
                  color="neutral"
                  block
                />
                <UButton
                  to="/dashboard/professional"
                  label="Back to overview"
                  variant="soft"
                  color="neutral"
                  block
                />
              </div>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <div
                class="flex items-center gap-2 text-sm uppercase tracking-wide text-dimmed"
              >
                <UIcon name="i-lucide-send" />
                Assigned work
              </div>
            </template>
            <p class="text-sm text-muted">
              Assigned jobs and project work will display here after integration.
            </p>
          </UCard>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'] },
    key: 'dashboard-professional-my-work',
    label: 'My Work',
    icon: 'i-lucide-briefcase-business',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
