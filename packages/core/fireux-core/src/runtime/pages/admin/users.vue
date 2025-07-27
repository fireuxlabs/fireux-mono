<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Users Overview</h2>
            <p>
              This section provides an overview of user statistics and
              management tools.
            </p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Recent Sign-ups</h2>
            <p>A list of recent user registrations will appear here.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Active Sessions</h2>
            <p>Display current active user sessions and activity metrics.</p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { useAdminRoutes } from '../../composables/app/routes/useAdminRoutes'

const adminGroup = useAdminRoutes()[0]
const route = adminGroup.children.find((r) => r.to === '/admin/users')
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
