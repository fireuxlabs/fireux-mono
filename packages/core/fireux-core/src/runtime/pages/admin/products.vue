<template>
  <ClientOnly>
    <div class="page">
      <!-- Product Create Section -->
      <FireOrganismsProductCreateSystem />
    </div>
  </ClientOnly>
</template>

<script setup>
import { useAdminRoutes } from '../../composables/app/routes/useAdminRoutes'

const adminGroup = useAdminRoutes()[0]
const route = adminGroup.children.find((r) => r.to === '/admin/products')
const { label, icon } = route

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
