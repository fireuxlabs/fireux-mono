<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Pending Orders</h2>
            <p>You have 2 items awaiting confirmation.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Order History</h2>
            <p>View your past transactions and downloads.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Wish List</h2>
            <p>Saved products you're keeping an eye on.</p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/utils/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/dashboard/orders')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
