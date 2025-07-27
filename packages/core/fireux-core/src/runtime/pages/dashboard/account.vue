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
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Account Activity</h2>
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Connected Devices</h2>
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
import { useAppUserRoutes } from '../../composables/app/routes/useAppUserRoutes'

const userGroup = useAppUserRoutes()[0]
const route = userGroup.children.find((r) => r.to === '/dashboard/account')
const { label, icon } = route

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})
</script>
