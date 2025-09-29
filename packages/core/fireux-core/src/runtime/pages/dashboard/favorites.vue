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
import { useUserRoutes } from '../../composables/app/routes/useUserRoutes'

const groups = useUserRoutes()
const userGroup = Array.isArray(groups) ? groups[0] : undefined
const entry = userGroup?.children?.find((r) => r.to === '/dashboard/favorites')
const label = entry?.label ?? 'Favorites'
const icon = entry?.icon ?? 'i-lucide-heart'

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
