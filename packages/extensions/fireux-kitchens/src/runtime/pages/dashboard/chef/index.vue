<!-- FILE: packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/index.vue -->
<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: let UDashboardPanel own body rhythm. -->
<template>
  <UDashboardPanel id="dashboard-chef-home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Chef" />
    </template>

    <template #body>
      <div class="grid gap-4 lg:grid-cols-3">
        <UCard class="lg:col-span-2">
          <div class="fx-card-body-stack">
            <p>Welcome back</p>
            <p>Keep your chef profile updated for faster discovery.</p>
          </div>

          <div class="fx-card__actions">
            <UButton
              to="/dashboard/chef/profile"
              label="Edit profile"
              color="neutral"
              size="sm"
            />
            <UButton
              to="/dashboard/chef/my-recipes"
              label="Open my recipes"
              variant="soft"
              color="neutral"
              size="sm"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="card__media">
              <UIcon name="i-lucide-sparkles" />
              Quick actions
            </div>
          </template>
          <div class="fx-card-body-stack">
            <UButton
              to="/dashboard/chef/profile"
              label="Add signature dishes"
              color="neutral"
              block
            />
            <UButton
              to="/dashboard/chef/profile"
              label="Update chef bio"
              variant="soft"
              color="neutral"
              block
            />
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="card__media">
            <UIcon name="i-lucide-flag" />
            Profile checklist
          </div>
        </template>
        <ul class="fx-card-body-stack">
          <li class="card__media">
            <UIcon name="i-lucide-check-circle" />
            Add signature dishes to showcase your style.
          </li>
          <li class="card__media">
            <UIcon name="i-lucide-check-circle" />
            Keep your headline and summary fresh.
          </li>
          <li class="card__media">
            <UIcon name="i-lucide-check-circle" />
            Upload a profile image to build trust.
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
    visibility: { modules: ['fireux-kitchens'], profiles: ['chef'] },
    key: 'dashboard-chef-home',
    label: 'Chef',
    icon: 'i-lucide-chef-hat',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})
</script>
