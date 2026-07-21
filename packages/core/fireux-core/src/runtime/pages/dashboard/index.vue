<!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
<!-- Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: keep the shared route as a thin shell around the three-layer overview. -->
<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <DashboardOverview />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import DashboardOverview from '../../components/Dashboard/Overview.vue'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

useHead({ title: 'Overview' })
</script>
