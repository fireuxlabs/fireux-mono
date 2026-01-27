<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/my-recipes.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-my-recipes">
    <template #header>
      <LayoutsDashboardNavbar title="My Recipes" />
    </template>

    <template #body>
      <div class="panels-stack">
        <section class="space-y-6">
          <UAlert
            icon="i-lucide-book-open"
            color="neutral"
            title="My Recipes"
            description="Recipe drafts, publication status, and analytics will live here."
          />

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-2">
              <template #header>
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-activity" />
                  Recipe overview
                </div>
              </template>
              <p class="text-sm text-muted">
                Placeholder content. Wire this card to your recipe store when
                available.
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
    key: 'dashboard-chef-recipes',
    label: 'My Recipes',
    icon: 'i-lucide-book-open',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})
</script>
