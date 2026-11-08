<template>
  <UDashboardPanel id="user-profile">
    <template #header><FireLayoutsDashboardNavbar title="Profile" /></template>
    <template #body>
      <UPage>
        <UPageBody class="pagebody fx-account-content">
          <UserEditProfile />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
useHead({ title: 'Profile' })
</script>
