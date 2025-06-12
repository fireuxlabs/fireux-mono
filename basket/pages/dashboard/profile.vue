<template>
  <client-only>
    <div v-if="appUser" class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserEdit />
          </template>
        </UCard>
      </div>

      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserCell :user="appUser" />
          </template>
        </UCard>
      </div>

      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserSummary :user="appUser" />
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserFollows :user="appUser" />
          </template>
        </UCard>
      </div>
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <OrganismsUserNotifications
              :notifications="appUser.notifications"
            />
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
const { label, icon } = getRouteMetaForPath('/dashboard/profile')

definePageMeta(() => ({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard'
  },
  title: label,
  icon: icon
}))

const { appUser } = useAppUser()
</script>
