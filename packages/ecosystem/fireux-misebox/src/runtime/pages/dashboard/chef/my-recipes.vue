<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/my-recipes.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-my-recipes">
    <template #header>
      <UDashboardNavbar title="My Recipes">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="space-y-6 p-6">
        <UAlert
          icon="i-lucide-book-open"
          color="neutral"
          title="My Recipes"
          description="Recipe drafts, publication status, and analytics will live here."
        />
        <UCard>
          <p class="text-sm text-muted">
            Placeholder content. Wire this card to your recipe store when
            available.
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
