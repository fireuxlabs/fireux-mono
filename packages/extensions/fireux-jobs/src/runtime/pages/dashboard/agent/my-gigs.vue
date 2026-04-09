<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/my-gigs.vue -->
<template>
  <UDashboardPanel id="console-agent-my-gigs">
    <template #header>
      <LayoutsDashboardNavbar title="My Gigs" />
    </template>

    <template #body>
      <div class="panels-stack">
        <section class="space-y-6">
          <UAlert
            icon="i-lucide-mic-2"
            color="neutral"
            title="My Gigs"
            description="Gig tracking will land here once the data source is wired up."
          />

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
              <template #header>
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-activity" />
                  Pipeline snapshot
                </div>
              </template>
              <p class="text-sm text-muted">
                Placeholder content. Replace with gig pipeline / analytics when
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
                  to="/dashboard/agent/profile"
                  label="Update agent profile"
                  color="neutral"
                  block
                />
                <UButton
                  to="/dashboard/agent"
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
    visibility: { modules: ['fireux-jobs'] },
    key: 'dashboard-agent-my-gigs',
    label: 'My Gigs',
    icon: 'i-lucide-radio-tower',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'agent',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
