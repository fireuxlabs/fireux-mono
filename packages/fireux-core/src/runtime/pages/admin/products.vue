<template>
  <ClientOnly>
    <div class="page">
      <!-- Product Create Section -->
      <FireOrganismsProductCreateSystem />
    </div>
  </ClientOnly>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/admin/products')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard',
  },
  title: label,
  icon: icon,
})
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
