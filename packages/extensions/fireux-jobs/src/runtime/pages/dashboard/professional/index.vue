<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue -->
<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: let UDashboardPanel own body rhythm. -->
<template>
  <UDashboardPanel id="dashboard-professional-home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Professional" />
    </template>

    <template #body>
      <UPageGrid>
        <UCard>
          <div class="fx-card-body-stack">
            <p>Welcome back</p>
            <p>Keep your professional profile fresh to boost discovery.</p>
          </div>

          <div>
            <UButton
              to="/dashboard/professional/profile"
              label="Edit profile"
              color="neutral"
              size="sm"
            />
            <UButton
              to="/dashboard/professional/my-jobs"
              label="View applications & work"
              variant="soft"
              color="neutral"
              size="sm"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <UIcon name="i-lucide-sparkles" />
              Quick actions
            </div>
          </template>
          <div class="fx-card-body-stack">
            <UButton
              to="/dashboard/professional/profile"
              label="Update headline"
              color="neutral"
              block
            />
            <UButton
              to="/dashboard/professional/profile"
              label="Add positions"
              variant="soft"
              color="neutral"
              block
            />
          </div>
        </UCard>
      </UPageGrid>

      <UCard>
        <template #header>
          <div>
            <UIcon name="i-lucide-flag" />
            Profile checklist
          </div>
        </template>
        <ul class="fx-card-body-stack">
          <li>
            <UIcon name="i-lucide-check-circle" />
            Add a summary that explains your focus.
          </li>
          <li>
            <UIcon name="i-lucide-check-circle" />
            List positions you’re open to.
          </li>
          <li>
            <UIcon name="i-lucide-check-circle" />
            Upload a profile image for credibility.
          </li>
        </ul>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['professional'] },
    key: 'dashboard-professional-home',
    label: 'Professional profile',
    icon: 'i-lucide-user-star',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
