<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-my-jobs">
    <template #header>
      <LayoutsDashboardNavbar title="My Jobs" />
    </template>

    <template #body>
      <div class="panels-stack">
        <section class="space-y-6">
          <UAlert
            icon="i-lucide-briefcase"
            color="neutral"
            title="My Jobs"
            description="Track saved, drafted, and published jobs here."
          />

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
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
                Published
              </div>
            </template>
            <p class="text-sm text-muted">
              Published jobs will display here after integration.
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
    key: 'dashboard-professional-extra-2',
    label: 'My Jobs',
    icon: 'i-lucide-briefcase-business',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
