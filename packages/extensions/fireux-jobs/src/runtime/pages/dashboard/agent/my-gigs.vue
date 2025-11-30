<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/my-gigs.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-my-gigs">
    <template #header>
      <UDashboardNavbar title="My Gigs">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="space-y-6 p-6">
        <UAlert
          icon="i-lucide-mic-2"
          color="neutral"
          title="My Gigs"
          description="Gig tracking will land here once the data source is wired up."
        />
        <UCard>
          <p class="text-sm text-muted">
            Placeholder content. Replace with gig pipeline / analytics when
            ready.
          </p>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-my-gigs',
    label: 'My Gigs',
    icon: 'i-lucide-radio-tower',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
