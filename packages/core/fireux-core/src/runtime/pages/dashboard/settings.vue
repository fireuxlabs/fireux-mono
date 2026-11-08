<template>
  <UDashboardPanel id="account-settings">
    <template #header><FireLayoutsDashboardNavbar title="Settings" /></template>
    <template #body>
      <UPage>
        <UPageBody class="pagebody fx-account-content">
          <UserAccountDetails>
            <details>
              <summary>Private AI context</summary>
              <FireContextRecord
                title="Private AI context"
                endpoint="/api/internal/user/context"
                :scope="{}"
                :maxlength="8000"
              />
            </details>
          </UserAccountDetails>
          <UserAccountSession />
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
    key: 'dashboard-settings',
    label: 'Settings',
    icon: 'i-lucide-settings',
    position: 'bottom',
    order: 1000,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
useHead({ title: 'Settings' })
</script>
