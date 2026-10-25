<template>
  <UDashboardPanel id="dashboard-admin-social-links">
    <template #header>
      <FireLayoutsDashboardNavbar title="Admin · Social links" />
    </template>
    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Sharer"
            title="Social links"
            description="Add the links presented by this App and keep their sharing order current."
          />
          <ShareProfileEditor />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Social links',
  requiresAuth: true,
  roles: ['admin'],
  adminSurface: {
    surface: true,
    key: 'social-links',
    label: 'Social links',
    description: 'Manage this App’s public sharing links.',
    icon: 'i-lucide-share-2',
    order: 10,
    owner: 'app',
  },
})
</script>
