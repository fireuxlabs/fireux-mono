<!-- FILE: packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue -->
<!-- Concurrent edit — 2026-07-21 14:05 CEST — CSS necessity pass: let UDashboardPanel own body rhythm. -->
<template>
  <UDashboardPanel id="dashboard-chef-my-recipes">
    <template #header>
      <FireLayoutsDashboardNavbar title="My Recipes" />
    </template>

    <template #body>
      <UAlert
        icon="i-lucide-book-open"
        color="neutral"
        title="My Recipes"
        description="Recipe drafts, publication status, and analytics will live here."
      />

      <UPageGrid as="div">
        <UCard>
          <template #header>
            <div class="card__media">
              <UIcon name="i-lucide-activity" />
              Recipe overview
            </div>
          </template>
          <p>
            Placeholder content. Wire this card to your recipe store when
            available.
          </p>
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
              label="Update profile"
              color="neutral"
              block
            />
            <UButton
              to="/dashboard/chef"
              label="Back to overview"
              variant="soft"
              color="neutral"
              block
            />
          </div>
        </UCard>
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['chef'] },
    key: 'dashboard-chef-recipes',
    label: 'My Recipes',
    icon: 'i-lucide-book-open',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})
</script>
