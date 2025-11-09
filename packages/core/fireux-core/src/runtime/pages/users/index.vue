<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Users"
      description="Inspect the current user, their overlays, and browse all users available to this runtime."
    />

    <UPageBody class="space-y-6">
      <OrganismsUserSectionsSingle />
      <OrganismsUserSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'FireUX users resolved for this runtime.',
  layout: 'default',
  name: 'UsersIndexPage',
})
</script>
