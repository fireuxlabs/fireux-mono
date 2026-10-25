<!-- Concurrent edit — 2026-07-21 16:25 CEST — Dashboard Admin pass: keep the shared route as a thin shell around the control room. -->
<template>
  <UDashboardPanel id="app-admin">
    <template #header>
      <FireLayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <AppDashboardAdmin />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import AppDashboardAdmin from '../../../app/components/Dashboard/Admin.vue'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin',
    label: 'Admin',
    icon: 'i-lucide-shield-check',
    position: 'middle',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: 'Admin' })
</script>
