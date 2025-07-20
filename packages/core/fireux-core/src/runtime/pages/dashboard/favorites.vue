<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Favorites</h2>
            <p>Placeholder for saved items or favorite products.</p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/dashboard/favorites')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
