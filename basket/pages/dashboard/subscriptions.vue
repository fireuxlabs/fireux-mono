<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Subscription Plan</h2>
            <p>
              You're currently on the Basic Plan. Upgrade anytime for more
              features.
            </p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Billing History</h2>
            <p>Review your past invoices and download receipts.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Payment Methods</h2>
            <p>Manage your saved cards and payment options.</p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '~/composables/utils/useRoutes'

const { label, icon } = getRouteMetaForPath('/dashboard/subscriptions')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard'
  },
  title: label,
  icon: icon
})
</script>
