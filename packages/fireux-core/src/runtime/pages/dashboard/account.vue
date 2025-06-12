<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserAccountEmail />
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserAccountPassword />
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Two-Factor Authentication</h2>
            <p>Enable or manage two-factor authentication settings.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Account Activity</h2>
            <p>View recent logins and activity on your account.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Connected Devices</h2>
            <p>Review and manage devices currently logged into your account.</p>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Delete Account</h2>
            <p>
              Request permanent deletion of your account and associated data.
            </p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/utils/useRoutes'

const { label, icon } = getRouteMetaForPath('/dashboard/account')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
